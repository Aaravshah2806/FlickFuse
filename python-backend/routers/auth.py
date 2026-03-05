"""
routers/auth.py — POST /register, POST /login, GET /me
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
import bcrypt
from pydantic import BaseModel, EmailStr, field_validator
import re

from database import get_pool
from middleware.auth import authenticate, create_access_token, create_refresh_token

router = APIRouter(prefix="/api/auth", tags=["auth"])



# ─── Schemas ──────────────────────────────────────────────────────────────────
class RegisterBody(BaseModel):
    email: EmailStr
    password: str
    username: str

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8 or len(v) > 128:
            raise ValueError("Password must be 8–128 characters")
        return v

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        if len(v) < 3 or len(v) > 30:
            raise ValueError("Username must be 3–30 characters")
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Username can only contain letters, numbers and underscores")
        return v


class LoginBody(BaseModel):
    email: EmailStr
    password: str


# ─── Routes ───────────────────────────────────────────────────────────────────
@router.post("/register", status_code=201)
async def register(body: RegisterBody):
    pool = get_pool()

    existing = await pool.fetchrow(
        "SELECT id FROM users WHERE email = $1 OR username = $2",
        body.email, body.username,
    )
    if existing:
        raise HTTPException(status_code=409, detail="Email or username already in use")

    password_hash = bcrypt.hashpw(body.password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
    user = await pool.fetchrow(
        """INSERT INTO users (email, password_hash, username)
           VALUES ($1, $2, $3)
           RETURNING id, email, username, unique_id, display_name, created_at""",
        body.email, password_hash, body.username,
    )

    return {
        "user": {
            "id": str(user["id"]),
            "email": user["email"],
            "username": user["username"],
            "uniqueId": user["unique_id"],
            "displayName": user["display_name"],
            "createdAt": user["created_at"].isoformat() if user["created_at"] else None,
        },
        "accessToken": create_access_token(str(user["id"])),
        "refreshToken": create_refresh_token(str(user["id"])),
    }


@router.post("/login")
async def login(body: LoginBody):
    pool = get_pool()

    user = await pool.fetchrow(
        """SELECT id, email, username, unique_id, display_name,
                  password_hash, email_verified
           FROM users WHERE email = $1""",
        body.email,
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user["password_hash"]:
        raise HTTPException(status_code=401, detail="This account uses social login")

    if not bcrypt.checkpw(body.password.encode('utf-8'), user["password_hash"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "user": {
            "id": str(user["id"]),
            "email": user["email"],
            "username": user["username"],
            "uniqueId": user["unique_id"],
            "displayName": user["display_name"],
            "emailVerified": user["email_verified"],
        },
        "accessToken": create_access_token(str(user["id"])),
        "refreshToken": create_refresh_token(str(user["id"])),
    }


@router.get("/me")
async def get_me(user_id: str = Depends(authenticate)):
    pool = get_pool()

    user = await pool.fetchrow(
        """SELECT id, email, username, unique_id, display_name,
                  profile_picture_url, bio, privacy_settings,
                  email_verified, created_at
           FROM users WHERE id = $1""",
        user_id,
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    import json
    return {
        "id": str(user["id"]),
        "email": user["email"],
        "username": user["username"],
        "uniqueId": user["unique_id"],
        "displayName": user["display_name"],
        "profilePictureUrl": user["profile_picture_url"],
        "bio": user["bio"],
        "privacySettings": json.loads(user["privacy_settings"]) if isinstance(user["privacy_settings"], str) else user["privacy_settings"],
        "emailVerified": user["email_verified"],
        "createdAt": user["created_at"].isoformat() if user["created_at"] else None,
    }
