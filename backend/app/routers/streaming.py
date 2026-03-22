from fastapi import APIRouter, HTTPException, Depends, Header, Query
from typing import List, Optional
import httpx
import os
from dotenv import load_dotenv

from ..schemas import ContentWithAvailability, StreamingAvailability

load_dotenv()

router = APIRouter(prefix="/api/streaming", tags=["Streaming Availability"])

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
STREAMING_API_KEY = os.getenv("STREAMING_AVAILABILITY_API_KEY", "")


def get_tmdb_headers():
    return {"accept": "application/json", "Authorization": f"Bearer {TMDB_API_KEY}"} if TMDB_API_KEY else {}


@router.get("/search-tmdb")
async def search_tmdb(
    query: str,
    page: int = Query(default=1, ge=1),
    content_type: Optional[str] = None
):
    if not TMDB_API_KEY:
        raise HTTPException(status_code=500, detail="TMDB API key not configured")
    
    base_url = "https://api.themoviedb.org/3/search/multi" if not content_type else \
               f"https://api.themoviedb.org/3/search/{content_type}"
    
    params = {
        "api_key": TMDB_API_KEY,
        "query": query,
        "page": page,
        "include_adult": False
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(base_url, params=params, headers=get_tmdb_headers(), timeout=15.0)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="TMDB API error")
        
        data = response.json()
        
        results = []
        for item in data.get("results", []):
            if item.get("media_type") not in ["movie", "tv"]:
                continue
            
            results.append({
                "tmdb_id": item["id"],
                "title": item.get("title") or item.get("name", ""),
                "content_type": "series" if item.get("media_type") == "tv" else "movie",
                "overview": item.get("overview"),
                "poster_path": f"https://image.tmdb.org/t/p/w500{item['poster_path']}" if item.get("poster_path") else None,
                "release_date": item.get("release_date") or item.get("first_air_date"),
                "vote_average": item.get("vote_average")
            })
        
        return {
            "results": results,
            "total_pages": data.get("total_pages", 1),
            "total_results": data.get("total_results", 0)
        }


@router.get("/tmdb/{tmdb_id}", response_model=ContentWithAvailability)
async def get_content_details(
    tmdb_id: int,
    country: str = Query(default="IN"),
    supabase_client=None
):
    if not TMDB_API_KEY:
        raise HTTPException(status_code=500, detail="TMDB API key not configured")
    
    async with httpx.AsyncClient() as client:
        movie_response = await client.get(
            f"https://api.themoviedb.org/3/movie/{tmdb_id}",
            params={"api_key": TMDB_API_KEY},
            headers=get_tmdb_headers(),
            timeout=15.0
        )
        
        tv_response = await client.get(
            f"https://api.themoviedb.org/3/tv/{tmdb_id}",
            params={"api_key": TMDB_API_KEY},
            headers=get_tmdb_headers(),
            timeout=15.0
        )
        
        if movie_response.status_code == 200:
            data = movie_response.json()
            content_type = "movie"
        elif tv_response.status_code == 200:
            data = tv_response.json()
            content_type = "series"
        else:
            raise HTTPException(status_code=404, detail="Content not found in TMDB")
        
        genres = [g["name"] for g in data.get("genres", [])]
        
        streaming_platforms = await get_streaming_availability(tmdb_id, country)
        
        return {
            "content": {
                "id": str(tmdb_id),
                "title": data.get("title") or data.get("name", ""),
                "content_type": content_type,
                "description": data.get("overview"),
                "poster_url": f"https://image.tmdb.org/t/p/w500{data['poster_path']}" if data.get("poster_path") else None,
                "release_year": int(data.get("release_date", "2000")[:4]) if data.get("release_date") else None,
                "tmdb_id": tmdb_id
            },
            "tmdb_id": tmdb_id,
            "overview": data.get("overview"),
            "genres": genres,
            "streaming_platforms": streaming_platforms
        }


async def get_streaming_availability(tmdb_id: int, country: str = "IN") -> List[StreamingAvailability]:
    platforms_map = {
        "netflix": {"name": "Netflix", "logo": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"},
        "prime": {"name": "Prime Video", "logo": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.svg"},
        "hotstar": {"name": "Disney+ Hotstar", "logo": "https://img.hotstar.com/assets/guest/v3/ic_hotstar.svg"},
        "disney": {"name": "Disney+", "logo": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg"},
        "hbo": {"name": "HBO Max", "logo": "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg"},
        "hulu": {"name": "Hulu", "logo": "https://upload.wikimedia.org/wikipedia/commons/0/01/Hulu_logo.svg"},
        "apple": {"name": "Apple TV+", "logo": "https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg"},
        "peacock": {"name": "Peacock", "logo": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Peacock_logo.svg"}
    }
    
    return []


@router.get("/availability/{tmdb_id}")
async def check_availability(
    tmdb_id: int,
    country: str = Query(default="IN")
):
    streaming_platforms = await get_streaming_availability(tmdb_id, country)
    
    return {
        "tmdb_id": tmdb_id,
        "country": country,
        "streaming_platforms": streaming_platforms,
        "total_platforms": len(streaming_platforms)
    }


@router.get("/trending")
async def get_trending(
    content_type: str = Query(default="all", pattern="^(all|movie|tv)$"),
    time_window: str = Query(default="week", pattern="^(day|week)$"),
    limit: int = Query(default=20, ge=1, le=50)
):
    if not TMDB_API_KEY:
        raise HTTPException(status_code=500, detail="TMDB API key not configured")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.themoviedb.org/3/trending/{content_type}/{time_window}",
            params={"api_key": TMDB_API_KEY},
            headers=get_tmdb_headers(),
            timeout=15.0
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="TMDB API error")
        
        data = response.json()
        
        results = []
        for item in data.get("results", [])[:limit]:
            results.append({
                "tmdb_id": item["id"],
                "title": item.get("title") or item.get("name", ""),
                "content_type": "series" if item.get("media_type") == "tv" or "first_air_date" in item else "movie",
                "poster_path": f"https://image.tmdb.org/t/p/w500{item['poster_path']}" if item.get("poster_path") else None,
                "vote_average": item.get("vote_average"),
                "popularity": item.get("popularity")
            })
        
        return {"results": results}


@router.get("/popular")
async def get_popular(
    content_type: str = Query(default="movie", pattern="^(movie|tv)$"),
    limit: int = Query(default=20, ge=1, le=50)
):
    if not TMDB_API_KEY:
        raise HTTPException(status_code=500, detail="TMDB API key not configured")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.themoviedb.org/3/{content_type}/popular",
            params={"api_key": TMDB_API_KEY},
            headers=get_tmdb_headers(),
            timeout=15.0
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="TMDB API error")
        
        data = response.json()
        
        results = []
        for item in data.get("results", [])[:limit]:
            results.append({
                "tmdb_id": item["id"],
                "title": item.get("title") or item.get("name", ""),
                "content_type": content_type,
                "poster_path": f"https://image.tmdb.org/t/p/w500{item['poster_path']}" if item.get("poster_path") else None,
                "vote_average": item.get("vote_average"),
                "release_date": item.get("release_date") or item.get("first_air_date")
            })
        
        return {"results": results}
