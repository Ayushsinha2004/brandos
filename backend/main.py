"""
Govind Brand OS - FastAPI Backend
Main application entry point
"""

# Load environment variables before anything else
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from routers import context_profiles, posts, content_generation, images
from database import init_db, SessionLocal
from services.startup_loader import load_all_existing_content
from config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and load existing content on startup"""
    # Initialize database tables
    init_db()

    # Load existing content from files
    db = SessionLocal()
    try:
        load_all_existing_content(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="Govind Brand OS API",
    description="AI-powered personal branding and content creation system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve images statically
if os.path.exists(settings.images_dir):
    app.mount("/images", StaticFiles(directory=settings.images_dir), name="images")

# Include routers
app.include_router(context_profiles.router, prefix="/api/context", tags=["Context Profiles"])
app.include_router(posts.router, prefix="/api/posts", tags=["Posts"])
app.include_router(content_generation.router, prefix="/api/generate", tags=["Content Generation"])
app.include_router(images.router, prefix="/api/images", tags=["Image Generation"])


@app.get("/")
async def root():
    return {
        "message": "Govind Brand OS API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
