"""Application configuration"""

import os
from pydantic_settings import BaseSettings
from functools import lru_cache

# Base project directory (Govind-Brand-Os subfolder)
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
PROJECT_DIR = os.path.join(BASE_DIR, "Govind-Brand-Os")


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    app_name: str = "Govind Brand OS API"
    debug: bool = False

    # Database
    database_url: str = "sqlite:///./brandos.db"

    # OpenAI
    openai_api_key: str = ""

    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:5173"]

    # Paths - pointing to Govind-Brand-Os subfolder
    context_dir: str = os.path.join(PROJECT_DIR, "context")
    posts_dir: str = os.path.join(
        PROJECT_DIR,
        "directives", "content", "linkedincontent", "posts"
    )
    images_dir: str = os.path.join(
        PROJECT_DIR,
        "directives", "content", "linkedincontent", "posts", "images"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
