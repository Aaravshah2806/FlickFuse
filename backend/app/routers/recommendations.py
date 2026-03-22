from fastapi import APIRouter, HTTPException, Depends, Header, Query
from typing import List, Optional
from supabase import Client
import os
from dotenv import load_dotenv

from ..schemas import (
    RecommendationResponse,
    RecommendationStatus,
    ContentResponse,
)

load_dotenv()

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


def get_supabase() -> Client:
    return Client(
        supabase_url=os.getenv("SUPABASE_URL", ""),
        supabase_key=os.getenv("SUPABASE_SERVICE_KEY", "")
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


@router.get("", response_model=List[RecommendationResponse])
async def get_recommendations(
    status: Optional[RecommendationStatus] = None,
    limit: int = Query(default=20, le=100),
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    query = supabase.table("recommendations").select(
        "*, content:content(*)"
    ).eq("user_id", user_id)
    
    if status:
        query = query.eq("status", status.value)
    else:
        query = query.neq("status", RecommendationStatus.REJECTED.value)
    
    result = query.order("match_score", desc=True).limit(limit).execute()
    return result.data


@router.post("/generate")
async def generate_recommendations(
    count: int = Query(default=10, ge=1, le=50),
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    taste_profile = supabase.table("taste_profiles").select("*").eq("user_id", user_id).execute()
    
    watched_content_ids = []
    watched = supabase.table("watch_history").select("content_id").eq("user_id", user_id).execute()
    for w in watched.data:
        if w.get("content_id"):
            watched_content_ids.append(w["content_id"])
    
    top_genres = taste_profile.data[0]["top_genres"] if taste_profile.data else []
    content_type_pref = taste_profile.data[0]["content_type_preference"] if taste_profile.data else "both"
    
    tmdb_api_key = os.getenv("TMDB_API_KEY")
    if not tmdb_api_key:
        return {"message": "TMDB API key not configured", "recommendations": []}
    
    recommendations = []
    
    for genre in (top_genres[:3] if top_genres else ["action", "comedy", "drama"]):
        import httpx
        
        genre_url = f"https://api.themoviedb.org/3/discover/movie"
        params = {
            "api_key": tmdb_api_key,
            "with_genres": genre,
            "sort_by": "popularity.desc",
            "page": 1
        }
        
        if content_type_pref == "movie":
            params["with_genres"] = genre
        elif content_type_pref == "series":
            genre_url = f"https://api.themoviedb.org/3/discover/tv"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(genre_url, params=params, timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    for item in data.get("results", [])[:3]:
                        tmdb_id = item["id"]
                        
                        existing_content = supabase.table("content").select("*").eq("tmdb_id", tmdb_id).execute()
                        
                        if existing_content.data:
                            content_id = existing_content.data[0]["id"]
                        else:
                            content_type = "series" if "first_air_date" in item else "movie"
                            insert_result = supabase.table("content").insert({
                                "title": item.get("title") or item.get("name", ""),
                                "content_type": content_type,
                                "tmdb_id": tmdb_id,
                                "poster_url": f"https://image.tmdb.org/t/p/w500{item.get('poster_path', '')}" if item.get("poster_path") else None,
                                "release_year": int(item.get("release_date", "2000")[:4]) if item.get("release_date") else None,
                                "description": item.get("overview")
                            }).execute()
                            content_id = insert_result.data[0]["id"]
                        
                        if content_id not in watched_content_ids:
                            existing_rec = supabase.table("recommendations").select("*").eq("user_id", user_id).eq("content_id", content_id).execute()
                            
                            if not existing_rec.data:
                                match_score = 0.5 + (hash(genre) % 50) / 100
                                supabase.table("recommendations").insert({
                                    "user_id": user_id,
                                    "content_id": content_id,
                                    "match_score": match_score,
                                    "reason": f"Because you like {genre} content",
                                    "source": "taste_profile",
                                    "status": "pending"
                                }).execute()
                                
                                recommendations.append({
                                    "title": item.get("title") or item.get("name", ""),
                                    "match_score": match_score,
                                    "genre": genre
                                })
        except Exception as e:
            continue
    
    return {
        "message": f"Generated {len(recommendations)} recommendations",
        "recommendations": recommendations
    }


@router.put("/{recommendation_id}")
async def update_recommendation_status(
    recommendation_id: str,
    status: RecommendationStatus,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    existing = supabase.table("recommendations").select("*").eq("id", recommendation_id).execute()
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    if existing.data[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this recommendation")
    
    result = supabase.table("recommendations").update({
        "status": status.value,
        "updated_at": "now()"
    }).eq("id", recommendation_id).execute()
    
    if status == RecommendationStatus.WATCHED:
        watch_data = existing.data[0]
        content_result = supabase.table("content").select("*").eq("id", watch_data["content_id"]).execute()
        if content_result.data:
            content = content_result.data[0]
            supabase.table("watch_history").insert({
                "user_id": user_id,
                "content_id": watch_data["content_id"],
                "content_title": content.get("title", ""),
                "content_type": content.get("content_type", "movie"),
                "watched_date": "now()"
            }).execute()
    
    return result.data[0]


@router.delete("/{recommendation_id}")
async def dismiss_recommendation(
    recommendation_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    existing = supabase.table("recommendations").select("*").eq("id", recommendation_id).execute()
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    if existing.data[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this recommendation")
    
    supabase.table("recommendations").delete().eq("id", recommendation_id).execute()
    
    return {"message": "Recommendation dismissed"}


@router.get("/friends", response_model=List[RecommendationResponse])
async def get_friend_recommendations(
    limit: int = Query(default=10, ge=1, le=50),
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    friend_ids = []
    friendships = supabase.table("friendships").select("friend_id").eq("user_id", user_id).execute()
    for f in friendships.data:
        friend_ids.append(f["friend_id"])
    
    if not friend_ids:
        return []
    
    watched_ids = []
    watched = supabase.table("watch_history").select("content_id").eq("user_id", user_id).execute()
    for w in watched.data:
        if w.get("content_id"):
            watched_ids.append(w["content_id"])
    
    result = supabase.table("recommendations").select(
        "*, content:content(*)"
    ).in_("user_id", friend_ids).eq("status", "accepted").execute()
    
    unique_content = {}
    for rec in result.data:
        if rec["content_id"] not in watched_ids and rec["content_id"] not in unique_content:
            unique_content[rec["content_id"]] = rec
    
    recommendations = list(unique_content.values())[:limit]
    return recommendations
