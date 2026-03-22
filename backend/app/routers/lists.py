from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
from supabase import Client
import os
from dotenv import load_dotenv

from ..schemas import (
    ListCreate,
    ListUpdate,
    ListResponse,
    ListItemCreate,
    ListItemResponse,
)

load_dotenv()

router = APIRouter(prefix="/api/lists", tags=["Lists"])


def get_supabase() -> Client:
    return Client(
        supabase_url=os.getenv("SUPABASE_URL", ""),
        supabase_key=os.getenv("SUPABASE_SERVICE_KEY", "")
    )


def get_current_user_id(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase()
    user = supabase.auth.get_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user.user.id


@router.get("", response_model=List[ListResponse])
async def get_lists(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    result = supabase.table("user_lists").select(
        "*, (SELECT COUNT(*) FROM list_items WHERE list_id = user_lists.id) as item_count"
    ).eq("user_id", user_id).order("updated_at", desc=True).execute()
    return result.data


@router.post("", response_model=ListResponse)
async def create_list(
    list_data: ListCreate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    data = {
        "user_id": user_id,
        "title": list_data.title,
        "description": list_data.description,
        "visibility": list_data.visibility.value
    }
    
    result = supabase.table("user_lists").insert(data).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create list")
    
    return {**result.data[0], "item_count": 0}


@router.get("/{list_id}", response_model=ListResponse)
async def get_list(
    list_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    result = supabase.table("user_lists").select(
        "*, (SELECT COUNT(*) FROM list_items WHERE list_id = user_lists.id) as item_count"
    ).eq("id", list_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="List not found")
    
    list_item = result.data[0]
    
    if list_item["user_id"] != user_id:
        if list_item["visibility"] == "private":
            raise HTTPException(status_code=403, detail="Not authorized to view this list")
    
    return list_item


@router.put("/{list_id}", response_model=ListResponse)
async def update_list(
    list_id: str,
    list_data: ListUpdate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    existing = supabase.table("user_lists").select("*").eq("id", list_id).execute()
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="List not found")
    
    if existing.data[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this list")
    
    update_data = {}
    if list_data.title is not None:
        update_data["title"] = list_data.title
    if list_data.description is not None:
        update_data["description"] = list_data.description
    if list_data.visibility is not None:
        update_data["visibility"] = list_data.visibility.value
    
    update_data["updated_at"] = "now()"
    
    result = supabase.table("user_lists").update(update_data).eq("id", list_id).execute()
    
    return {**result.data[0], "item_count": existing.data[0].get("item_count", 0)}


@router.delete("/{list_id}")
async def delete_list(
    list_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    existing = supabase.table("user_lists").select("*").eq("id", list_id).execute()
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="List not found")
    
    if existing.data[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this list")
    
    supabase.table("user_lists").delete().eq("id", list_id).execute()
    
    return {"message": "List deleted"}


@router.get("/{list_id}/items", response_model=List[ListItemResponse])
async def get_list_items(
    list_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    list_result = supabase.table("user_lists").select("*").eq("id", list_id).execute()
    
    if not list_result.data:
        raise HTTPException(status_code=404, detail="List not found")
    
    list_item = list_result.data[0]
    
    if list_item["user_id"] != user_id and list_item["visibility"] == "private":
        raise HTTPException(status_code=403, detail="Not authorized to view this list")
    
    result = supabase.table("list_items").select(
        "*, content:content(*)"
    ).eq("list_id", list_id).order("position").execute()
    
    return result.data


@router.post("/{list_id}/items", response_model=ListItemResponse)
async def add_list_item(
    list_id: str,
    item_data: ListItemCreate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    list_result = supabase.table("user_lists").select("*").eq("id", list_id).execute()
    
    if not list_result.data:
        raise HTTPException(status_code=404, detail="List not found")
    
    if list_result.data[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to add items to this list")
    
    existing = supabase.table("list_items").select("*").eq("list_id", list_id).eq("content_id", item_data.content_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Content already in list")
    
    if item_data.position == 0:
        max_pos = supabase.table("list_items").select("position").eq("list_id", list_id).order("position", desc=True).limit(1).execute()
        new_position = (max_pos.data[0]["position"] + 1) if max_pos.data else 0
    else:
        new_position = item_data.position
    
    result = supabase.table("list_items").insert({
        "list_id": list_id,
        "content_id": item_data.content_id,
        "position": new_position
    }).execute()
    
    supabase.table("user_lists").update({"updated_at": "now()"}).eq("id", list_id).execute()
    
    return result.data[0]


@router.delete("/{list_id}/items/{content_id}")
async def remove_list_item(
    list_id: str,
    content_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    list_result = supabase.table("user_lists").select("*").eq("id", list_id).execute()
    
    if not list_result.data:
        raise HTTPException(status_code=404, detail="List not found")
    
    if list_result.data[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to remove items from this list")
    
    supabase.table("list_items").delete().eq("list_id", list_id).eq("content_id", content_id).execute()
    
    supabase.table("user_lists").update({"updated_at": "now()"}).eq("id", list_id).execute()
    
    return {"message": "Item removed from list"}


@router.put("/{list_id}/reorder")
async def reorder_list_items(
    list_id: str,
    item_ids: List[str],
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    list_result = supabase.table("user_lists").select("*").eq("id", list_id).execute()
    
    if not list_result.data:
        raise HTTPException(status_code=404, detail="List not found")
    
    if list_result.data[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to reorder this list")
    
    for i, content_id in enumerate(item_ids):
        supabase.table("list_items").update({"position": i}).eq("list_id", list_id).eq("content_id", content_id).execute()
    
    return {"message": "List reordered"}
