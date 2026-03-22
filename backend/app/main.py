from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="FlickFuse API",
    description="Backend API for FlickFuse streaming recommendation platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import (
    friends_router,
    lists_router,
    recommendations_router,
    taste_profiles_router,
    streaming_router,
)

app.include_router(friends_router)
app.include_router(lists_router)
app.include_router(recommendations_router)
app.include_router(taste_profiles_router)
app.include_router(streaming_router)


@app.get("/")
async def root():
    return {"message": "FlickFuse API", "status": "healthy"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api")
async def api_info():
    return {
        "name": "FlickFuse API",
        "version": "1.0.0",
        "endpoints": {
            "friends": "/api/friends",
            "lists": "/api/lists",
            "recommendations": "/api/recommendations",
            "taste_profile": "/api/taste-profile",
            "streaming": "/api/streaming"
        }
    }
