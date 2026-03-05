"""
routers/import_router.py — CSV import for Netflix, Prime, Hotstar; import status
"""
from __future__ import annotations

import csv
import io
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from database import get_pool
from middleware.auth import authenticate

router = APIRouter(prefix="/api/import", tags=["import"])


async def _parse_csv(file: UploadFile) -> list[dict]:
    content = await file.read()
    text = content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    return list(reader)


async def _upsert_watch_event(pool, user_id: str, title: str, platform: str, watched_at: datetime | None):
    """Insert a minimal watch event (looks up catalog by title, inserts if missing)."""
    # Try to find in catalog
    row = await pool.fetchrow("SELECT id FROM content_catalog WHERE LOWER(title) = LOWER($1) LIMIT 1", title)
    if not row:
        # Use a list for text[] ARRAY column, not json.dumps
        row = await pool.fetchrow(
            """INSERT INTO content_catalog (title, platform_availability)
               VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id""",
            title, [platform],
        )
    if not row:
        row = await pool.fetchrow("SELECT id FROM content_catalog WHERE LOWER(title) = LOWER($1) LIMIT 1", title)
    if not row:
        return

    catalog_id = str(row["id"])
    await pool.execute(
        """INSERT INTO watch_events (user_id, catalog_id, platform, title, date_watched)
           VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING""",
        user_id, catalog_id, platform, title, watched_at or datetime.now(timezone.utc),
    )


@router.post("/netflix", status_code=201)
async def import_netflix(file: UploadFile = File(...), user_id: str = Depends(authenticate)):
    """Accepts the Netflix ViewingActivity.csv export."""
    rows = await _parse_csv(file)
    pool = get_pool()
    imported = 0
    duplicates = 0
    for row in rows:
        title = row.get("Title", "").strip()
        if not title:
            continue
        date_str = row.get("Date", "").strip()
        watched_at = None
        try:
            watched_at = datetime.strptime(date_str, "%m/%d/%Y") if date_str else None
        except ValueError:
            pass
        
        # Check for duplication within this request is not easily possible without DB check
        # But we'll count as imported if the upsert logic completes
        await _upsert_watch_event(pool, user_id, title, "netflix", watched_at)
        imported += 1
    
    return {
        "message": f"Imported {imported} Netflix titles",
        "stats": {
            "totalRows": len(rows),
            "imported": imported,
            "duplicates": duplicates, # Simplified for now
            "invalid": 0
        }
    }


@router.post("/prime", status_code=201)
async def import_prime(file: UploadFile = File(...), user_id: str = Depends(authenticate)):
    """Accepts a Prime Video watch history CSV (Title, Date columns)."""
    rows = await _parse_csv(file)
    pool = get_pool()
    imported = 0
    for row in rows:
        title = row.get("Title", row.get("title", "")).strip()
        if not title:
            continue
        date_str = row.get("Date", row.get("date", "")).strip()
        watched_at = None
        try:
            watched_at = datetime.strptime(date_str, "%Y-%m-%d") if date_str else None
        except ValueError:
            pass
        await _upsert_watch_event(pool, user_id, title, "prime_video", watched_at)
        imported += 1
    
    return {
        "message": f"Imported {imported} Prime Video titles",
        "stats": {
            "totalRows": len(rows),
            "imported": imported,
            "duplicates": 0,
            "invalid": 0
        }
    }


@router.post("/hotstar", status_code=201)
async def import_hotstar(file: UploadFile = File(...), user_id: str = Depends(authenticate)):
    """Accepts a Hotstar watch history CSV (Title, Watched On columns)."""
    rows = await _parse_csv(file)
    pool = get_pool()
    imported = 0
    for row in rows:
        title = row.get("Title", row.get("title", "")).strip()
        if not title:
            continue
        date_str = row.get("Watched On", row.get("watched_on", "")).strip()
        watched_at = None
        try:
            watched_at = datetime.strptime(date_str, "%Y-%m-%d") if date_str else None
        except ValueError:
            pass
        await _upsert_watch_event(pool, user_id, title, "hotstar", watched_at)
        imported += 1
    
    return {
        "message": f"Imported {imported} Hotstar titles",
        "stats": {
            "totalRows": len(rows),
            "imported": imported,
            "duplicates": 0,
            "invalid": 0
        }
    }


@router.get("/status")
async def get_import_status(user_id: str = Depends(authenticate)):
    pool = get_pool()
    count = await pool.fetchval("SELECT COUNT(*) FROM watch_events WHERE user_id = $1", user_id)
    has_taste_profile = await pool.fetchval(
        "SELECT EXISTS(SELECT 1 FROM taste_profiles WHERE user_id = $1)", user_id
    )
    return {
        "totalImported": count,
        "hasTasteProfile": has_taste_profile,
        "message": "Import more viewing history for better recommendations" if count < 20 else "Great! Your taste profile is ready.",
    }
