"""
routers/users.py — profile, update, privacy, taste-profile, search
"""
from __future__ import annotations

import json
import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator

from database import get_pool
from middleware.auth import authenticate

router = APIRouter(prefix="/api/users", tags=["users"])


class UpdateProfileBody(BaseModel):
    displayName: Optional[str] = None
    bio: Optional[str] = None
    username: Optional[str] = None

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if len(v) < 3 or len(v) > 30 or not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Invalid username")
        return v

    @field_validator("displayName")
    @classmethod
    def display_name_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (len(v) < 1 or len(v) > 100):
            raise ValueError("displayName must be 1–100 characters")
        return v


class UpdatePrivacyBody(BaseModel):
    profileVisibility: Optional[str] = None
    tasteProfileSharing: Optional[str] = None
    activityVisibility: Optional[bool] = None
    recommendationSharing: Optional[bool] = None


@router.get("/profile")
async def get_profile(user_id: str = Depends(authenticate)):
    pool = get_pool()
    row = await pool.fetchrow(
        """SELECT id, email, username, unique_id, display_name,
                  profile_picture_url, bio, privacy_settings,
                  email_verified, created_at
           FROM users WHERE id = $1""",
        user_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(row["id"]),
        "email": row["email"],
        "username": row["username"],
        "uniqueId": row["unique_id"],
        "displayName": row["display_name"],
        "profilePictureUrl": row["profile_picture_url"],
        "bio": row["bio"],
        "privacySettings": row["privacy_settings"],
        "emailVerified": row["email_verified"],
        "createdAt": row["created_at"].isoformat() if row["created_at"] else None,
    }


@router.put("/profile")
async def update_profile(body: UpdateProfileBody, user_id: str = Depends(authenticate)):
    pool = get_pool()
    updates, values = [], []
    idx = 1

    if body.displayName is not None:
        updates.append(f"display_name = ${idx}"); values.append(body.displayName); idx += 1
    if body.bio is not None:
        updates.append(f"bio = ${idx}"); values.append(body.bio); idx += 1
    if body.username is not None:
        existing = await pool.fetchrow(
            "SELECT id FROM users WHERE username = $1 AND id != $2", body.username, user_id
        )
        if existing:
            raise HTTPException(status_code=409, detail="Username already taken")
        updates.append(f"username = ${idx}"); values.append(body.username); idx += 1

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    values.append(user_id)
    row = await pool.fetchrow(
        f"UPDATE users SET {', '.join(updates)} WHERE id = ${idx} "
        f"RETURNING id, email, username, unique_id, display_name, bio, profile_picture_url",
        *values,
    )
    u = row
    return {
        "id": str(u["id"]), "email": u["email"], "username": u["username"],
        "uniqueId": u["unique_id"], "displayName": u["display_name"],
        "bio": u["bio"], "profilePictureUrl": u["profile_picture_url"],
    }


@router.put("/privacy")
async def update_privacy(body: UpdatePrivacyBody, user_id: str = Depends(authenticate)):
    pool = get_pool()
    current = await pool.fetchrow("SELECT privacy_settings FROM users WHERE id = $1", user_id)
    existing = current["privacy_settings"] or {}
    if isinstance(existing, str):
        existing = json.loads(existing)

    if body.profileVisibility:
        existing["profile_visibility"] = body.profileVisibility
    if body.tasteProfileSharing:
        existing["taste_profile_sharing"] = body.tasteProfileSharing
    if body.activityVisibility is not None:
        existing["activity_visibility"] = body.activityVisibility
    if body.recommendationSharing is not None:
        existing["recommendation_sharing"] = body.recommendationSharing

    await pool.execute(
        "UPDATE users SET privacy_settings = $1 WHERE id = $2",
        json.dumps(existing), user_id,
    )
    return {"privacySettings": existing}


@router.get("/taste-profile")
async def get_taste_profile(user_id: str = Depends(authenticate)):
    pool = get_pool()
    row = await pool.fetchrow("SELECT * FROM taste_profiles WHERE user_id = $1", user_id)
    if not row:
        return {"message": "No taste profile yet. Import your watch history to generate one.", "tasteProfile": None}
    return {
        "tasteProfile": {
            "genreVector": row["genre_vector"],
            "languagePreferences": row["language_preferences"],
            "viewingPatterns": row["viewing_patterns"],
            "recentFavorites": row["recent_favorites"],
            "lastComputedAt": row["last_computed_at"].isoformat() if row["last_computed_at"] else None,
        }
    }


@router.get("/search")
async def search_user(uniqueId: str, user_id: str = Depends(authenticate)):
    pool = get_pool()
    row = await pool.fetchrow(
        """SELECT u.id, u.username, u.unique_id, u.display_name, u.profile_picture_url,
                  tp.genre_vector, tp.language_preferences
           FROM users u
           LEFT JOIN taste_profiles tp ON tp.user_id = u.id
           WHERE u.unique_id = $1""",
        uniqueId.upper(),
    )
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(row["id"]),
        "username": row["username"],
        "uniqueId": row["unique_id"],
        "displayName": row["display_name"],
        "profilePictureUrl": row["profile_picture_url"],
        "tasteProfile": {
            "genreVector": row["genre_vector"],
            "languagePreferences": row["language_preferences"],
        } if row["genre_vector"] else None,
    }
