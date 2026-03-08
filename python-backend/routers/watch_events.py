"""
routers/watch_events.py — GET /api/watch-events/
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database import get_pool
from middleware.auth import authenticate

router = APIRouter(prefix="/api/watch-events", tags=["watch-events"])


@router.get("")
async def get_watch_history(user_id: str = Depends(authenticate)):
    pool = get_pool()
    rows = await pool.fetch(
        """SELECT we.id, we.date_watched, we.progress_percent, we.platform,
                  cc.id as catalog_id, cc.title, cc.content_type,
                  cc.genres, cc.poster_path
           FROM watch_events we
           JOIN content_catalog cc ON cc.id = we.catalog_id
           WHERE we.user_id = $1
           ORDER BY we.date_watched DESC
           LIMIT 50""",
        user_id,
    )
    return {
        "watchHistory": [
            {
                "id": str(r["id"]),
                "watchedAt": r["date_watched"].isoformat() if r["date_watched"] else None,
                "progressPercent": r["progress_percent"],
                "platform": r["platform"],
                "catalogId": str(r["catalog_id"]),
                "title": r["title"],
                "contentType": r["content_type"],
                "genres": r["genres"],
                "posterPath": r["poster_path"],
            }
            for r in rows
        ]
    }


class ReactionBody(BaseModel):
    reaction: str

@router.post("/{event_id}/reaction")
async def add_reaction(event_id: str, body: ReactionBody, user_id: str = Depends(authenticate)):
    pool = get_pool()
    row = await pool.fetchrow(
        "UPDATE watch_events SET reaction = $1 WHERE id = $2 AND user_id = $3 RETURNING id",
        body.reaction, event_id, user_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="Watch event not found")
    return {"success": True, "reaction": body.reaction}
