from .friends import router as friends_router
from .lists import router as lists_router
from .recommendations import router as recommendations_router
from .taste_profiles import router as taste_profiles_router
from .streaming import router as streaming_router

__all__ = [
    "friends_router",
    "lists_router",
    "recommendations_router",
    "taste_profiles_router",
    "streaming_router",
]
