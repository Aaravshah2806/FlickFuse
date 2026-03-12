"""
database.py — asyncpg connection pool + redis async client + cache helpers
"""
from __future__ import annotations

import os
import asyncpg
import redis.asyncio as aioredis
from dotenv import load_dotenv

load_dotenv()

# ─── Globals ──────────────────────────────────────────────────────────────────
_pool: asyncpg.Pool | None = None
_redis: aioredis.Redis | None = None
_redis_connected: bool = False

# ─── PostgreSQL ───────────────────────────────────────────────────────────────
async def _init_connection(conn):
    await conn.set_type_codec(
        'uuid',
        encoder=str,
        decoder=str,
        schema='pg_catalog',
        format='text'
    )

async def connect_postgres() -> None:
    global _pool
    try:
        _pool = await asyncpg.create_pool(
            dsn=os.getenv("DATABASE_URL"),
            min_size=2,
            max_size=20,
            command_timeout=10,
            init=_init_connection
        )
        print("✓ PostgreSQL connected")
    except Exception as exc:
        print(f"⚠  PostgreSQL not available – running without database: {exc}")


async def close_postgres() -> None:
    if _pool:
        await _pool.close()


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Database pool not initialised")
    return _pool


# ─── Redis ────────────────────────────────────────────────────────────────────
async def connect_redis() -> None:
    global _redis, _redis_connected
    try:
        _redis = aioredis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379"),
            encoding="utf-8",
            decode_responses=True,
        )
        await _redis.ping()
        _redis_connected = True
        print("✓ Redis connected")
    except Exception as exc:
        print(f"⚠  Redis not available – caching disabled: {exc}")


async def close_redis() -> None:
    if _redis and _redis_connected:
        await _redis.aclose()


# ─── Cache Helpers ────────────────────────────────────────────────────────────
async def cache_get(key: str) -> str | None:
    if not _redis_connected or _redis is None:
        return None
    try:
        return await _redis.get(key)
    except Exception:
        return None


async def cache_set(key: str, value: str, ttl_seconds: int = 3600) -> None:
    if not _redis_connected or _redis is None:
        return
    try:
        await _redis.setex(key, ttl_seconds, value)
    except Exception:
        pass
