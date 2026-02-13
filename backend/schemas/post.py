"""Pydantic schemas for Post API"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PostStatusEnum(str, Enum):
    DRAFTING = "Drafting"
    REVIEW = "Review"
    PUBLISHED = "Published"
    ARCHIVED = "Archived"


class ContentTypeEnum(str, Enum):
    STORY = "Story-Based"
    FRAMEWORK = "Framework"
    CONTRARIAN = "Contrarian Opinion"
    CASE_STUDY = "Case Study"
    INSIGHT = "Insight"


class CTATypeEnum(str, Enum):
    COMMENT = "Comment"
    SHARE = "Share"
    FOLLOW = "Follow"
    LINK = "Link"
    DM = "DM"


class PostImageCreate(BaseModel):
    style: str
    file_path: str
    prompt: Optional[str] = None


class PostImageResponse(BaseModel):
    id: int
    post_id: int
    style: str
    file_path: str
    prompt: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    hook: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
    source: Optional[str] = "Manual"
    status: Optional[PostStatusEnum] = PostStatusEnum.DRAFTING
    content_type: Optional[ContentTypeEnum] = None
    cta_type: Optional[CTATypeEnum] = None
    target_audience: Optional[str] = None
    key_topics: Optional[List[str]] = None
    image_prompts: Optional[dict] = None


class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    hook: Optional[str] = None
    content: Optional[str] = None
    source: Optional[str] = None
    status: Optional[PostStatusEnum] = None
    content_type: Optional[ContentTypeEnum] = None
    cta_type: Optional[CTATypeEnum] = None
    target_audience: Optional[str] = None
    key_topics: Optional[List[str]] = None
    image_prompts: Optional[dict] = None


class PostResponse(BaseModel):
    id: int
    number: int
    title: str
    slug: str
    hook: str
    content: str
    source: Optional[str]
    status: str
    content_type: Optional[str]
    cta_type: Optional[str]
    target_audience: Optional[str]
    key_topics: Optional[List[str]]
    image_prompts: Optional[dict]
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    images: List[PostImageResponse] = []

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    posts: List[PostResponse]
    total: int
    page: int
    page_size: int
