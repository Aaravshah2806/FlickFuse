"""
middleware/auth.py — JWT authentication dependency for FastAPI
Verifies Clerk-issued RS256 JWTs via JWKS, with HS256 fallback for legacy tokens.
"""
from __future__ import annotations

import os
import json
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt, jwk
from database import get_pool

# Legacy HS256 secret (fallback for locally-issued tokens)
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-prod")
ACCESS_EXPIRY_HOURS = int(os.getenv("JWT_ACCESS_EXPIRY_HOURS", "24"))
REFRESH_EXPIRY_DAYS = int(os.getenv("JWT_REFRESH_EXPIRY_DAYS", "30"))

# Clerk JWKS endpoint for RS256 verification
CLERK_ISSUER = os.getenv("CLERK_ISSUER", "")
CLERK_JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json" if CLERK_ISSUER else ""

_bearer = HTTPBearer(auto_error=False)

# Cache for JWKS keys
_jwks_cache: dict | None = None


def _fetch_jwks() -> dict:
    """Fetch and cache JWKS from Clerk."""
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache
    if not CLERK_JWKS_URL:
        return {"keys": []}
    try:
        import urllib.request
        req = urllib.request.Request(CLERK_JWKS_URL)
        with urllib.request.urlopen(req, timeout=5) as resp:
            _jwks_cache = json.loads(resp.read().decode())
            return _jwks_cache
    except Exception as e:
        print(f"Failed to fetch Clerk JWKS: {e}")
        return {"keys": []}


def _get_jwk_key(token: str) -> tuple[dict | None, str]:
    """
    Get the correct JWK public key for verifying an RS256 token.
    Returns (key_dict, algorithm) or (None, algorithm) if not found.
    """
    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")
        kid = header.get("kid")

        if alg not in ("RS256", "ES256") or not kid:
            return None, alg

        jwks = _fetch_jwks()
        for key_data in jwks.get("keys", []):
            if key_data.get("kid") == kid:
                return key_data, alg

        # Kid not found, try refreshing cache
        global _jwks_cache
        _jwks_cache = None
        jwks = _fetch_jwks()
        for key_data in jwks.get("keys", []):
            if key_data.get("kid") == kid:
                return key_data, alg

        return None, alg
    except Exception:
        return None, "HS256"


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_EXPIRY_HOURS)
    return jwt.encode({"userId": user_id, "exp": expire}, JWT_SECRET, algorithm="HS256")


def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_EXPIRY_DAYS)
    return jwt.encode({"userId": user_id, "exp": expire}, JWT_SECRET, algorithm="HS256")


async def authenticate(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """
    FastAPI dependency. Returns the userId string from a valid Bearer JWT.
    Supports both Clerk RS256 tokens (via JWKS) and legacy HS256 tokens.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    token = credentials.credentials

    try:
        # Determine algorithm from token header
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")

        if alg in ("RS256", "ES256"):
            # Clerk token — verify with JWKS public key
            key_data, _ = _get_jwk_key(token)
            if not key_data:
                raise ValueError("No matching JWKS key found for token kid")

            public_key = jwk.construct(key_data, algorithm=alg)

            payload = jwt.decode(
                token,
                public_key,
                algorithms=[alg],
                options={"verify_aud": False},
                issuer=CLERK_ISSUER if CLERK_ISSUER else None,
            )
            # Clerk ID is a string (e.g. user_...), map to deterministic UUID for DB
            raw_id = payload.get("sub")
            if not raw_id:
                raise ValueError("sub missing from Clerk payload")
            user_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"clerk:{raw_id}"))
        else:
            # Legacy HS256 token — verify with shared secret
            payload = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            user_id = payload.get("userId")

        if not user_id:
            raise ValueError("userId/sub missing from payload")

        # Auto-provision user in our database if not exists
        try:
            pool = get_pool()
            # Note: Postgres will handle the string-to-uuid conversion if the column is type UUID
            exists = await pool.fetchval("SELECT id FROM users WHERE id = $1", user_id)
            if not exists:
                email = payload.get("email") or f"{user_id}@placeholder.com"
                # Clerk stores metadata differently
                user_meta = payload.get("user_metadata", {})
                base_username = user_meta.get("username") or email.split("@")[0]
                username = f"{base_username}_{str(user_id)[:5]}"
                unique_id = str(user_id)[:8].upper()

                try:
                    await pool.execute("""
                        INSERT INTO users (id, email, username, display_name, unique_id)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT DO NOTHING
                    """, user_id, email, username, base_username, unique_id)
                except Exception as e:
                    print(f"Failed to auto-provision user {user_id}: {e}")
        except RuntimeError:
            # Database not available — still allow auth to succeed
            pass

        return user_id
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
        )
