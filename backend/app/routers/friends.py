from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
from supabase import create_client, Client
import os
from dotenv import load_dotenv

from ..schemas import (
    FriendRequestCreate,
    FriendRequestResponse,
    FriendResponse,
    ProfileResponse,
    FriendshipStatus,
)

load_dotenv()

router = APIRouter(prefix="/api/friends", tags=["Friends"])


def get_supabase() -> Client:
    return create_client(
        os.getenv("SUPABASE_URL", ""),
        os.getenv("SUPABASE_SERVICE_KEY", "")
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


@router.get("/requests", response_model=List[FriendRequestResponse])
async def get_friend_requests(
    status: Optional[FriendshipStatus] = None,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    query = supabase.table("friend_requests").select(
        "*, sender:profiles!friend_requests_sender_id_fkey(*), receiver:profiles!friend_requests_receiver_id_fkey(*)"
    ).or_(
        f"sender_id.eq.{user_id},receiver_id.eq.{user_id}"
    )
    
    if status:
        query = query.eq("status", status.value)
    
    result = query.order("created_at", desc=True).execute()
    return result.data


@router.get("/requests/incoming", response_model=List[FriendRequestResponse])
async def get_incoming_requests(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    result = supabase.table("friend_requests").select(
        "*, sender:profiles!friend_requests_sender_id_fkey(*)"
    ).eq("receiver_id", user_id).eq("status", "pending").order("created_at", desc=True).execute()
    return result.data


@router.get("/requests/outgoing", response_model=List[FriendRequestResponse])
async def get_outgoing_requests(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    result = supabase.table("friend_requests").select(
        "*, receiver:profiles!friend_requests_receiver_id_fkey(*)"
    ).eq("sender_id", user_id).eq("status", "pending").order("created_at", desc=True).execute()
    return result.data


@router.post("/requests", response_model=FriendRequestResponse)
async def send_friend_request(
    request: FriendRequestCreate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    if request.receiver_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")
    
    existing = supabase.table("friend_requests").select("*").or_(
        f"and(sender_id.eq.{user_id},receiver_id.eq.{request.receiver_id}),"
        f"and(sender_id.eq.{request.receiver_id},receiver_id.eq.{user_id})"
    ).execute()
    
    if existing.data:
        raise HTTPException(status_code=400, detail="Friend request already exists")
    
    existing_friendship = supabase.table("friendships").select("*").or_(
        f"and(user_id.eq.{user_id},friend_id.eq.{request.receiver_id}),"
        f"and(user_id.eq.{request.receiver_id},friend_id.eq.{user_id})"
    ).execute()
    
    if existing_friendship.data:
        raise HTTPException(status_code=400, detail="Already friends")
    
    result = supabase.table("friend_requests").insert({
        "sender_id": user_id,
        "receiver_id": request.receiver_id,
        "status": "pending"
    }).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create friend request")
    
    return result.data[0]


@router.post("/requests/{request_id}/accept", response_model=FriendRequestResponse)
async def accept_friend_request(
    request_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    existing = supabase.table("friend_requests").select("*").eq("id", request_id).execute()
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    friend_request = existing.data[0]
    
    if friend_request["receiver_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to accept this request")
    
    if friend_request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Request already processed")
    
    supabase.rpc("accept_friend_request", {"request_id": request_id}).execute()
    
    updated = supabase.table("friend_requests").select(
        "*, sender:profiles!friend_requests_sender_id_fkey(*), receiver:profiles!friend_requests_receiver_id_fkey(*)"
    ).eq("id", request_id).execute()
    
    return updated.data[0]


@router.post("/requests/{request_id}/reject", response_model=FriendRequestResponse)
async def reject_friend_request(
    request_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    existing = supabase.table("friend_requests").select("*").eq("id", request_id).execute()
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    friend_request = existing.data[0]
    
    if friend_request["receiver_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to reject this request")
    
    result = supabase.table("friend_requests").update({
        "status": "rejected",
        "updated_at": "now()"
    }).eq("id", request_id).execute()
    
    return result.data[0]


@router.delete("/requests/{request_id}")
async def cancel_friend_request(
    request_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    existing = supabase.table("friend_requests").select("*").eq("id", request_id).execute()
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    friend_request = existing.data[0]
    
    if friend_request["sender_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this request")
    
    supabase.table("friend_requests").delete().eq("id", request_id).execute()
    
    return {"message": "Friend request cancelled"}


@router.get("", response_model=List[FriendResponse])
async def get_friends(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    result = supabase.table("friendships").select(
        "*, friend:profiles!friendships_friend_id_fkey(*)"
    ).eq("user_id", user_id).order("created_at", desc=True).execute()
    return result.data


@router.delete("/{friend_id}")
async def remove_friend(
    friend_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    supabase.table("friendships").delete().eq("user_id", user_id).eq("friend_id", friend_id).execute()
    supabase.table("friendships").delete().eq("user_id", friend_id).eq("friend_id", user_id).execute()
    return {"message": "Friend removed"}


@router.get("/search", response_model=List[ProfileResponse])
async def search_users(
    query: str,
    limit: int = 10,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    result = supabase.table("profiles").select("*").or_(
        f"username.ilike.%{query}%,display_name.ilike.%{query}%,unique_id.ilike.%{query}%"
    ).neq("id", user_id).limit(limit).execute()
    return result.data
