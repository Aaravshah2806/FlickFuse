"""
routers/recommendations.py — get, generate, feedback
"""
from __future__ import annotations

import json
import random
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database import get_pool
from middleware.auth import authenticate

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

MOCK_RECOMMENDATIONS = [
    {"catalogId": None, "title": "Dark", "matchScore": 92, "reason": "Perfect for fans of Breaking Bad — complex narratives with sci-fi twists", "platform": "Netflix", "posterPath": "/apbrbWs5M9iqwaH1jKMJCr2Uqgh.jpg", "genres": ["Thriller", "Sci-Fi", "Mystery"]},
    {"catalogId": None, "title": "Money Heist", "matchScore": 88, "reason": "Intense heist thriller matching your preference for crime dramas", "platform": "Netflix", "posterPath": "/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg", "genres": ["Thriller", "Drama", "Crime"]},
    {"catalogId": None, "title": "Sacred Games", "matchScore": 85, "reason": "Award-winning Indian thriller with the same gritty intensity you enjoy", "platform": "Netflix", "posterPath": "/fxmFTAznL3aQV9ghJNGnGFEUfLV.jpg", "genres": ["Thriller", "Crime", "Drama"]},
    {"catalogId": None, "title": "Succession", "matchScore": 83, "reason": "Character-driven drama with sharp writing and complex family dynamics", "platform": "Hotstar", "posterPath": None, "genres": ["Drama", "Comedy"]},
    {"catalogId": None, "title": "Stranger Things", "matchScore": 80, "reason": "Beloved sci-fi mystery series with compelling character arcs", "platform": "Netflix", "posterPath": "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", "genres": ["Sci-Fi", "Drama", "Horror"]},
]


class FeedbackBody(BaseModel):
    feedback: Literal["watched", "want_to_watch", "not_interested"]


@router.get("/")
async def get_recommendations(user_id: str = Depends(authenticate)):
    pool = get_pool()
    rows = await pool.fetch(
        """SELECT r.id, r.match_score, r.reason, r.user_feedback, r.generated_at,
                  cc.id as catalog_id, cc.title, cc.genres, cc.languages, cc.content_type,
                  cc.synopsis, cc.ratings, cc.platform_availability, cc.poster_path, cc.tmdb_id
           FROM recommendations r
           JOIN content_catalog cc ON cc.id = r.catalog_id
           WHERE r.user_id = $1
             AND (r.user_feedback IS NULL OR r.user_feedback != 'not_interested')
           ORDER BY r.match_score DESC, r.generated_at DESC
           LIMIT 20""",
        user_id,
    )
    if rows:
        return {
            "recommendations": [
                {
                    "id": str(r["id"]),
                    "title": r["title"],
                    "matchScore": r["match_score"],
                    "reason": r["reason"],
                    "genres": r["genres"],
                    "contentType": r["content_type"],
                    "synopsis": r["synopsis"],
                    "ratings": r["ratings"],
                    "platforms": r["platform_availability"],
                    "posterPath": r["poster_path"],
                    "tmdbId": r["tmdb_id"],
                    "userFeedback": r["user_feedback"],
                    "generatedAt": r["generated_at"].isoformat() if r["generated_at"] else None,
                }
                for r in rows
            ],
            "source": "database",
        }
    return {
        "recommendations": MOCK_RECOMMENDATIONS,
        "source": "mock",
        "message": "Import your watch history to get personalized AI recommendations.",
    }


@router.post("/generate")
async def generate_recommendations(user_id: str = Depends(authenticate)):
    pool = get_pool()
    profile = await pool.fetchrow("SELECT * FROM taste_profiles WHERE user_id = $1", user_id)

    # Auto-generate a taste profile from watch history if one doesn't exist
    if not profile:
        # Build genre_vector from the user's imported watch events
        genre_rows = await pool.fetch(
            """SELECT cc.genres FROM watch_events we
               JOIN content_catalog cc ON cc.id = we.catalog_id
               WHERE we.user_id = $1 AND cc.genres IS NOT NULL""",
            user_id,
        )
        if not genre_rows:
            raise HTTPException(
                status_code=400,
                detail="No taste profile found. Please import your watch history first.",
            )
        genre_vector: dict[str, int] = {}
        for row in genre_rows:
            for genre in (row["genres"] or []):
                genre_vector[genre] = genre_vector.get(genre, 0) + 1

        await pool.execute(
            "DELETE FROM taste_profiles WHERE user_id = $1",
            user_id,
        )
        await pool.execute(
            """INSERT INTO taste_profiles (user_id, genre_vector)
               VALUES ($1, $2::jsonb)""",
            user_id, json.dumps(genre_vector),
        )
        profile = await pool.fetchrow("SELECT * FROM taste_profiles WHERE user_id = $1", user_id)

    catalog_rows = await pool.fetch(
        """SELECT cc.* FROM content_catalog cc
           WHERE cc.id NOT IN (SELECT catalog_id FROM recommendations WHERE user_id = $1)
           ORDER BY (cc.ratings->>'imdb')::float DESC NULLS LAST
           LIMIT 10""",
        user_id,
    )
    if not catalog_rows:
        return {"message": "All catalog items have been recommended.", "generated": 0}

    # Handle genre_vector being either a dict or a JSON string
    gv = profile["genre_vector"] or {}
    if isinstance(gv, str):
        gv = json.loads(gv)
    top_genres = list(gv.keys())[:3]
    for item in catalog_rows:
        genres = item["genres"] or []
        overlap = sum(1 for g in genres if g in top_genres)
        match_score = min(95, 60 + overlap * 12 + random.randint(0, 9))
        genre_list = " & ".join(genres[:2]) if genres else "great storytelling"
        reason = f"Matches your taste for {genre_list} — {match_score}% compatible with your profile"
        await pool.execute(
            """INSERT INTO recommendations (user_id, catalog_id, match_score, reason)
               VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING""",
            user_id, str(item["id"]), match_score, reason,
        )
    return {"message": "Recommendations generated successfully", "generated": len(catalog_rows)}


@router.post("/{rec_id}/feedback")
async def submit_feedback(rec_id: str, body: FeedbackBody, user_id: str = Depends(authenticate)):
    pool = get_pool()
    row = await pool.fetchrow(
        """UPDATE recommendations SET user_feedback = $1, feedback_at = NOW()
           WHERE id = $2 AND user_id = $3 RETURNING id""",
        body.feedback, rec_id, user_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return {"success": True, "id": rec_id, "feedback": body.feedback}
