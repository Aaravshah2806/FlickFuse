from fastapi import APIRouter, HTTPException, Depends, Header
from supabase import Client
import os
from dotenv import load_dotenv

from ..schemas import TasteProfileResponse, UserPreferencesResponse, UserPreferencesUpdate

load_dotenv()

router = APIRouter(prefix="/api/taste-profile", tags=["Taste Profile"])


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


@router.get("", response_model=TasteProfileResponse)
async def get_taste_profile(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    result = supabase.table("taste_profiles").select("*").eq("user_id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Taste profile not found. Generate one first.")
    
    return result.data[0]


@router.post("/generate", response_model=TasteProfileResponse)
async def generate_taste_profile(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    supabase.rpc("generate_taste_profile", {"p_user_id": user_id}).execute()
    
    result = supabase.table("taste_profiles").select("*").eq("user_id", user_id).execute()
    
    return result.data[0]


@router.get("/preferences", response_model=UserPreferencesResponse)
async def get_preferences(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    result = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
    
    if not result.data:
        default_prefs = {
            "user_id": user_id,
            "preferred_content_types": ["movie", "series"],
            "preferred_languages": [],
            "exclude_watched": False
        }
        insert_result = supabase.table("user_preferences").insert(default_prefs).execute()
        return insert_result.data[0]
    
    return result.data[0]


@router.put("/preferences", response_model=UserPreferencesResponse)
async def update_preferences(
    prefs: UserPreferencesUpdate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    existing = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
    
    update_data = {"updated_at": "now()"}
    
    if prefs.preferred_content_types is not None:
        update_data["preferred_content_types"] = [t.value for t in prefs.preferred_content_types]
    if prefs.preferred_languages is not None:
        update_data["preferred_languages"] = prefs.preferred_languages
    if prefs.exclude_watched is not None:
        update_data["exclude_watched"] = prefs.exclude_watched
    
    if existing.data:
        result = supabase.table("user_preferences").update(update_data).eq("user_id", user_id).execute()
    else:
        update_data["user_id"] = user_id
        if "preferred_content_types" not in update_data:
            update_data["preferred_content_types"] = ["movie", "series"]
        if "preferred_languages" not in update_data:
            update_data["preferred_languages"] = []
        if "exclude_watched" not in update_data:
            update_data["exclude_watched"] = False
        result = supabase.table("user_preferences").insert(update_data).execute()
    
    return result.data[0]


@router.get("/compatibility/{other_user_id}")
async def get_taste_compatibility(
    other_user_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    my_profile = supabase.table("taste_profiles").select("*").eq("user_id", user_id).execute()
    their_profile = supabase.table("taste_profiles").select("*").eq("user_id", other_user_id).execute()
    
    if not my_profile.data or not their_profile.data:
        raise HTTPException(status_code=404, detail="One or both taste profiles not found")
    
    my_genres = my_profile.data[0]["genre_scores"]
    their_genres = their_profile.data[0]["genre_scores"]
    
    common_genres = set(my_genres.keys()) & set(their_genres.keys())
    
    if not common_genres:
        similarity_score = 0.0
    else:
        differences = []
        for genre in common_genres:
            diff = abs(float(my_genres.get(genre, 0)) - float(their_genres.get(genre, 0)))
            differences.append(diff)
        similarity_score = 1.0 - (sum(differences) / len(differences))
    
    my_top = set(my_profile.data[0]["top_genres"])
    their_top = set(their_profile.data[0]["top_genres"])
    shared_interests = my_top & their_top
    
    return {
        "similarity_score": round(similarity_score, 2),
        "shared_interests": list(shared_interests),
        "common_genre_count": len(common_genres),
        "my_top_genres": my_profile.data[0]["top_genres"],
        "their_top_genres": their_profile.data[0]["top_genres"]
    }
