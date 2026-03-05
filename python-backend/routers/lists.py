"""
routers/lists.py — CRUD for user_lists + list items
"""
from __future__ import annotations

from typing import Literal, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, UUID4

from database import get_pool
from middleware.auth import authenticate

router = APIRouter(prefix="/api/lists", tags=["lists"])


class CreateListBody(BaseModel):
    title: str
    description: Optional[str] = None
    visibility: Literal["public", "friends", "private"] = "friends"

    def validate_title(self) -> None:
        if not self.title or len(self.title) > 200:
            raise ValueError("title must be 1–200 characters")


class UpdateListBody(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[Literal["public", "friends", "private"]] = None


class AddItemBody(BaseModel):
    catalogId: UUID4
    notes: Optional[str] = None


# ─── Lists CRUD ───────────────────────────────────────────────────────────────
@router.get("/")
async def get_lists(user_id: str = Depends(authenticate)):
    pool = get_pool()
    rows = await pool.fetch(
        """SELECT l.*,
                  (SELECT COUNT(*) FROM user_list_items WHERE list_id = l.id) as item_count
           FROM user_lists l
           WHERE l.user_id = $1
           ORDER BY l.created_at DESC""",
        user_id,
    )
    return {"lists": [dict(r) for r in rows]}


@router.post("/", status_code=201)
async def create_list(body: CreateListBody, user_id: str = Depends(authenticate)):
    if not body.title or len(body.title.strip()) == 0:
        raise HTTPException(status_code=400, detail="title is required")
    pool = get_pool()
    row = await pool.fetchrow(
        """INSERT INTO user_lists (user_id, title, description, visibility)
           VALUES ($1, $2, $3, $4) RETURNING *""",
        user_id, body.title, body.description, body.visibility,
    )
    return {"list": dict(row)}


@router.put("/{list_id}")
async def update_list(list_id: str, body: UpdateListBody, user_id: str = Depends(authenticate)):
    pool = get_pool()
    updates, values = [], []
    idx = 1

    if body.title is not None:
        updates.append(f"title = ${idx}"); values.append(body.title); idx += 1
    if body.description is not None:
        updates.append(f"description = ${idx}"); values.append(body.description); idx += 1
    if body.visibility is not None:
        updates.append(f"visibility = ${idx}"); values.append(body.visibility); idx += 1

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    values += [list_id, user_id]
    row = await pool.fetchrow(
        f"UPDATE user_lists SET {', '.join(updates)} WHERE id = ${idx} AND user_id = ${idx+1} RETURNING *",
        *values,
    )
    if not row:
        raise HTTPException(status_code=404, detail="List not found")
    return {"list": dict(row)}


@router.delete("/{list_id}")
async def delete_list(list_id: str, user_id: str = Depends(authenticate)):
    pool = get_pool()
    await pool.execute("DELETE FROM user_lists WHERE id = $1 AND user_id = $2", list_id, user_id)
    return {"success": True}


# ─── List Items ───────────────────────────────────────────────────────────────
@router.get("/{list_id}/items")
async def get_list_items(list_id: str, user_id: str = Depends(authenticate)):
    pool = get_pool()
    lst = await pool.fetchrow("SELECT * FROM user_lists WHERE id = $1", list_id)
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    if str(lst["user_id"]) != user_id and lst["visibility"] == "private":
        raise HTTPException(status_code=403, detail="Access denied")
    items = await pool.fetch(
        """SELECT li.id, li.position, li.notes, li.added_at,
                  cc.id as catalog_id, cc.title, cc.genres, cc.content_type,
                  cc.platform_availability, cc.poster_path, cc.ratings
           FROM user_list_items li
           JOIN content_catalog cc ON cc.id = li.catalog_id
           WHERE li.list_id = $1 ORDER BY li.position ASC""",
        list_id,
    )
    return {"list": dict(lst), "items": [dict(i) for i in items]}


@router.post("/{list_id}/items", status_code=201)
async def add_list_item(list_id: str, body: AddItemBody, user_id: str = Depends(authenticate)):
    pool = get_pool()
    lst = await pool.fetchrow(
        "SELECT id FROM user_lists WHERE id = $1 AND user_id = $2", list_id, user_id
    )
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    next_pos = await pool.fetchval(
        "SELECT COALESCE(MAX(position), 0) + 1 FROM user_list_items WHERE list_id = $1", list_id
    )
    row = await pool.fetchrow(
        """INSERT INTO user_list_items (list_id, catalog_id, position, notes)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (list_id, catalog_id) DO NOTHING RETURNING id""",
        list_id, str(body.catalogId), next_pos, body.notes,
    )
    if not row:
        raise HTTPException(status_code=409, detail="Item already in list")
    return {"success": True, "itemId": str(row["id"])}


@router.delete("/{list_id}/items/{item_id}")
async def remove_list_item(list_id: str, item_id: str, user_id: str = Depends(authenticate)):
    pool = get_pool()
    lst = await pool.fetchrow(
        "SELECT id FROM user_lists WHERE id = $1 AND user_id = $2", list_id, user_id
    )
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    await pool.execute(
        "DELETE FROM user_list_items WHERE id = $1 AND list_id = $2", item_id, list_id
    )
    return {"success": True}
