"""
main.py — FastAPI application entry point for FlickFuse Python backend
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import sys

# Configure structured logging
logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("flickfuse")

load_dotenv()

from database import connect_postgres, close_postgres, connect_redis, close_redis
from routers import auth, users, friends, lists, watch_events, recommendations, import_router


# ─── Lifespan (startup / shutdown) ───────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FlickFuse API (Python) starting up…")
    await connect_postgres()
    await connect_redis()
    yield
    await close_postgres()
    await close_redis()
    logger.info("FlickFuse API shut down")


# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="FlickFuse API",
    version="1.0.0",
    description="FlickFuse backend — Python / FastAPI edition",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
origins = (
    ["https://flickfuse.app"]
    if os.getenv("ENV") == "production"
    else [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Global exception handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"error": "Internal server error"})


# ─── Health ───────────────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health():
    return {
        "status": "ok",
        "service": "FlickFuse API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": os.getenv("ENV", "development"),
        "runtime": "Python / FastAPI",
    }


# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(friends.router)
app.include_router(lists.router)
app.include_router(watch_events.router)
app.include_router(recommendations.router)
app.include_router(import_router.router)


# ─── Run directly ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
