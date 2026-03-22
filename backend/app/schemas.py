from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class FriendshipStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class RecommendationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WATCHED = "watched"


class VisibilityLevel(str, Enum):
    PUBLIC = "public"
    FRIENDS = "friends"
    PRIVATE = "private"


class ContentType(str, Enum):
    MOVIE = "movie"
    SERIES = "series"


class RecommendationSource(str, Enum):
    TASTE_PROFILE = "taste_profile"
    FRIENDS = "friends"
    TRENDING = "trending"
    SIMILAR = "similar"


class FriendRequestCreate(BaseModel):
    receiver_id: str


class FriendRequestResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    status: FriendshipStatus
    created_at: datetime
    updated_at: datetime
    sender: Optional["ProfileResponse"] = None
    receiver: Optional["ProfileResponse"] = None


class ProfileResponse(BaseModel):
    id: str
    username: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    unique_id: str
    privacy_setting: str = "public"
    created_at: datetime
    updated_at: datetime


class FriendResponse(BaseModel):
    id: str
    user_id: str
    friend_id: str
    created_at: datetime
    friend: Optional[ProfileResponse] = None


class ListCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    visibility: VisibilityLevel = VisibilityLevel.PRIVATE


class ListUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    visibility: Optional[VisibilityLevel] = None


class ListResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    visibility: VisibilityLevel
    created_at: datetime
    updated_at: datetime
    item_count: Optional[int] = 0


class ListItemCreate(BaseModel):
    content_id: str
    position: Optional[int] = 0


class ListItemResponse(BaseModel):
    id: str
    list_id: str
    content_id: str
    position: int
    added_at: datetime
    content: Optional["ContentResponse"] = None


class ContentResponse(BaseModel):
    id: str
    title: str
    content_type: ContentType
    description: Optional[str] = None
    poster_url: Optional[str] = None
    release_year: Optional[int] = None
    tmdb_id: Optional[int] = None


class TasteProfileResponse(BaseModel):
    id: str
    user_id: str
    genre_scores: dict
    content_type_preference: str
    language_preferences: List[str] = []
    top_genres: List[str] = []
    watch_history_summary: dict
    last_updated: datetime
    created_at: datetime


class RecommendationResponse(BaseModel):
    id: str
    user_id: str
    content_id: str
    match_score: float
    reason: Optional[str] = None
    source: RecommendationSource
    status: RecommendationStatus
    created_at: datetime
    content: Optional[ContentResponse] = None


class StreamingAvailability(BaseModel):
    platform: str
    platform_name: str
    logo_url: Optional[str] = None
    url: Optional[str] = None


class ContentWithAvailability(BaseModel):
    content: ContentResponse
    tmdb_id: Optional[int] = None
    overview: Optional[str] = None
    genres: List[str] = []
    streaming_platforms: List[StreamingAvailability] = []


class UserPreferencesResponse(BaseModel):
    id: str
    user_id: str
    preferred_content_types: List[ContentType] = []
    preferred_languages: List[str] = []
    exclude_watched: bool = False
    updated_at: datetime
    created_at: datetime


class UserPreferencesUpdate(BaseModel):
    preferred_content_types: Optional[List[ContentType]] = None
    preferred_languages: Optional[List[str]] = None
    exclude_watched: Optional[bool] = None


FriendRequestResponse.model_rebuild()
ListItemResponse.model_rebuild()
