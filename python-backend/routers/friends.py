"""
routers/friends.py — friends list, request, accept, remove, pending, profile
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database import get_pool
from middleware.auth import authenticate

router = APIRouter(prefix="/api/friends", tags=["friends"])


class FriendRequestBody(BaseModel):
    uniqueId: str


@router.get("/")
async def get_friends(user_id: str = Depends(authenticate)):
    pool = get_pool()

    sent = await pool.fetch(
        """SELECT f.id, f.created_at, f.accepted_at,
                  u.id as friend_id, u.username, u.unique_id, u.display_name, u.profile_picture_url,
                  tp.genre_vector, tp.language_preferences
           FROM friendships f
           JOIN users u ON u.id = f.friend_id
           LEFT JOIN taste_profiles tp ON tp.user_id = u.id
           WHERE f.user_id = $1 AND f.status = 'accepted'
           ORDER BY f.accepted_at DESC""",
        user_id,
    )
    received = await pool.fetch(
        """SELECT f.id, f.created_at, f.accepted_at,
                  u.id as friend_id, u.username, u.unique_id, u.display_name, u.profile_picture_url,
                  tp.genre_vector, tp.language_preferences
           FROM friendships f
           JOIN users u ON u.id = f.user_id
           LEFT JOIN taste_profiles tp ON tp.user_id = u.id
           WHERE f.friend_id = $1 AND f.status = 'accepted'
           ORDER BY f.accepted_at DESC""",
        user_id,
    )

    def fmt(r: dict) -> dict:
        return {
            "friendshipId": str(r["id"]),
            "friendId": str(r["friend_id"]),
            "username": r["username"],
            "uniqueId": r["unique_id"],
            "displayName": r["display_name"],
            "profilePictureUrl": r["profile_picture_url"],
            "tasteProfile": {
                "genreVector": r["genre_vector"],
                "languagePreferences": r["language_preferences"],
            } if r["genre_vector"] else None,
            "friendsSince": r["accepted_at"].isoformat() if r["accepted_at"] else None,
        }

    all_friends = [fmt(r) for r in list(sent) + list(received)]
    return {"friends": all_friends, "count": len(all_friends)}


@router.post("/request", status_code=201)
async def send_friend_request(body: FriendRequestBody, user_id: str = Depends(authenticate)):
    pool = get_pool()
    if not body.uniqueId:
        raise HTTPException(status_code=400, detail="uniqueId is required")

    target = await pool.fetchrow(
        "SELECT id, username, unique_id, display_name FROM users WHERE unique_id = $1",
        body.uniqueId.upper(),
    )
    if not target:
        raise HTTPException(status_code=404, detail="User not found with that ID")
    if str(target["id"]) == user_id:
        raise HTTPException(status_code=400, detail="Cannot add yourself as a friend")

    existing = await pool.fetchrow(
        """SELECT id, status FROM friendships
           WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)""",
        user_id, str(target["id"]),
    )
    if existing:
        raise HTTPException(status_code=409, detail=f"Friendship already exists with status: {existing['status']}")

    await pool.execute(
        "INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, 'pending')",
        user_id, str(target["id"]),
    )
    return {
        "message": "Friend request sent",
        "friend": {
            "id": str(target["id"]),
            "username": target["username"],
            "uniqueId": target["unique_id"],
            "displayName": target["display_name"],
        },
    }


@router.get("/requests")
async def get_pending_requests(user_id: str = Depends(authenticate)):
    pool = get_pool()
    rows = await pool.fetch(
        """SELECT f.id, f.created_at,
                  u.id as requester_id, u.username, u.unique_id, u.display_name, u.profile_picture_url
           FROM friendships f
           JOIN users u ON u.id = f.user_id
           WHERE f.friend_id = $1 AND f.status = 'pending'
           ORDER BY f.created_at DESC""",
        user_id,
    )
    return {
        "requests": [
            {
                "requestId": str(r["id"]),
                "requesterId": str(r["requester_id"]),
                "username": r["username"],
                "uniqueId": r["unique_id"],
                "displayName": r["display_name"],
                "profilePictureUrl": r["profile_picture_url"],
                "requestedAt": r["created_at"].isoformat() if r["created_at"] else None,
            }
            for r in rows
        ]
    }


@router.post("/{friendship_id}/accept")
async def accept_request(friendship_id: str, user_id: str = Depends(authenticate)):
    pool = get_pool()
    row = await pool.fetchrow(
        """UPDATE friendships SET status = 'accepted', accepted_at = NOW()
           WHERE id = $1 AND friend_id = $2 AND status = 'pending'
           RETURNING id""",
        friendship_id, user_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Friend request not found")
    return {"success": True, "message": "Friend request accepted"}


@router.delete("/{friendship_id}")
async def remove_friend(friendship_id: str, user_id: str = Depends(authenticate)):
    pool = get_pool()
    await pool.execute(
        "DELETE FROM friendships WHERE id = $1 AND (user_id = $2 OR friend_id = $2)",
        friendship_id, user_id,
    )
    return {"success": True}


@router.get("/{friend_user_id}/profile")
async def get_friend_profile(friend_user_id: str, user_id: str = Depends(authenticate)):
    pool = get_pool()

    friendship = await pool.fetchrow(
        """SELECT id FROM friendships
           WHERE status = 'accepted'
             AND ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))""",
        user_id, friend_user_id,
    )
    if not friendship:
        raise HTTPException(status_code=403, detail="Not friends with this user")

    u = await pool.fetchrow(
        """SELECT u.id, u.username, u.unique_id, u.display_name, u.profile_picture_url, u.bio,
                  tp.genre_vector, tp.language_preferences, tp.viewing_patterns, tp.recent_favorites
           FROM users u
           LEFT JOIN taste_profiles tp ON tp.user_id = u.id
           WHERE u.id = $1""",
        friend_user_id,
    )
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    lists = await pool.fetch(
        """SELECT id, title, description, visibility, created_at,
                  (SELECT COUNT(*) FROM user_list_items WHERE list_id = user_lists.id) as item_count
           FROM user_lists WHERE user_id = $1 AND visibility IN ('public', 'friends')
           ORDER BY created_at DESC LIMIT 10""",
        friend_user_id,
    )

    return {
        "id": str(u["id"]),
        "username": u["username"],
        "uniqueId": u["unique_id"],
        "displayName": u["display_name"],
        "profilePictureUrl": u["profile_picture_url"],
        "bio": u["bio"],
        "tasteProfile": {
            "genreVector": u["genre_vector"],
            "languagePreferences": u["language_preferences"],
            "viewingPatterns": u["viewing_patterns"],
            "recentFavorites": u["recent_favorites"],
        } if u["genre_vector"] else None,
        "publicLists": [dict(r) for r in lists],
    }
