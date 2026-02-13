"""Post model for LinkedIn posts"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from database import Base


class PostStatus(str, enum.Enum):
    DRAFTING = "Drafting"
    REVIEW = "Review"
    PUBLISHED = "Published"
    ARCHIVED = "Archived"


class ContentType(str, enum.Enum):
    STORY = "Story-Based"
    FRAMEWORK = "Framework"
    CONTRARIAN = "Contrarian Opinion"
    CASE_STUDY = "Case Study"
    INSIGHT = "Insight"


class CTAType(str, enum.Enum):
    COMMENT = "Comment"
    SHARE = "Share"
    FOLLOW = "Follow"
    LINK = "Link"
    DM = "DM"


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer, unique=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True)
    hook = Column(Text, nullable=False)
    content = Column(Text, nullable=False)

    # Metadata
    source = Column(String(255), default="Manual")
    status = Column(String(50), default=PostStatus.DRAFTING.value)
    content_type = Column(String(50), nullable=True)
    cta_type = Column(String(50), nullable=True)
    target_audience = Column(String(255), nullable=True)
    key_topics = Column(JSON, nullable=True)  # List of topics

    # Image prompts (JSON structure for 3 styles)
    image_prompts = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)

    # Relationships
    images = relationship("PostImage", back_populates="post", cascade="all, delete-orphan")


class PostImage(Base):
    __tablename__ = "post_images"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    style = Column(String(50), nullable=False)  # technical, apple, business_results
    file_path = Column(String(512), nullable=False)
    prompt = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    post = relationship("Post", back_populates="images")
