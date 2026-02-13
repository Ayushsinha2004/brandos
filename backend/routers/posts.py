"""Posts API Router"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import re
import os
from datetime import datetime

from database import get_db
from models.post import Post, PostImage
from schemas.post import (
    PostCreate, PostUpdate, PostResponse, PostListResponse,
    PostStatusEnum, ContentTypeEnum, CTATypeEnum
)
from config import get_settings

router = APIRouter()
settings = get_settings()

# Path to posts directory
POSTS_DIR = settings.posts_dir


def generate_slug(title: str) -> str:
    """Generate a URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')


def get_next_post_number(db: Session) -> int:
    """Get the next available post number"""
    last_post = db.query(Post).order_by(desc(Post.number)).first()
    return (last_post.number + 1) if last_post else 1


@router.get("/", response_model=PostListResponse)
async def list_posts(
    status: Optional[PostStatusEnum] = None,
    content_type: Optional[ContentTypeEnum] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List all posts with optional filtering and pagination"""
    query = db.query(Post)

    if status:
        query = query.filter(Post.status == status.value)

    if content_type:
        query = query.filter(Post.content_type == content_type.value)

    total = query.count()

    posts = query.order_by(desc(Post.created_at)).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    return PostListResponse(
        posts=[PostResponse.model_validate(p) for p in posts],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/by-number/{number}", response_model=PostResponse)
async def get_post_by_number(number: int, db: Session = Depends(get_db)):
    """Get a post by its number"""
    post = db.query(Post).filter(Post.number == number).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post number {number} not found"
        )

    return PostResponse.model_validate(post)


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get a specific post by ID"""
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post not found: {post_id}"
        )

    return PostResponse.model_validate(post)


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    db: Session = Depends(get_db)
):
    """Create a new post"""
    number = get_next_post_number(db)
    slug = generate_slug(post_data.title)

    # Ensure unique slug
    existing_slug = db.query(Post).filter(Post.slug == slug).first()
    if existing_slug:
        slug = f"{slug}-{number}"

    post = Post(
        number=number,
        title=post_data.title,
        slug=slug,
        hook=post_data.hook,
        content=post_data.content,
        source=post_data.source,
        status=post_data.status.value if post_data.status else PostStatusEnum.DRAFTING.value,
        content_type=post_data.content_type.value if post_data.content_type else None,
        cta_type=post_data.cta_type.value if post_data.cta_type else None,
        target_audience=post_data.target_audience,
        key_topics=post_data.key_topics,
        image_prompts=post_data.image_prompts
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    return PostResponse.model_validate(post)


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_data: PostUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing post"""
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post not found: {post_id}"
        )

    update_data = post_data.model_dump(exclude_unset=True)

    # Handle enums
    if "status" in update_data and update_data["status"]:
        update_data["status"] = update_data["status"].value
        if update_data["status"] == PostStatusEnum.PUBLISHED.value:
            post.published_at = datetime.utcnow()

    if "content_type" in update_data and update_data["content_type"]:
        update_data["content_type"] = update_data["content_type"].value

    if "cta_type" in update_data and update_data["cta_type"]:
        update_data["cta_type"] = update_data["cta_type"].value

    # Update title should update slug
    if "title" in update_data:
        update_data["slug"] = generate_slug(update_data["title"])

    for key, value in update_data.items():
        setattr(post, key, value)

    db.commit()
    db.refresh(post)

    return PostResponse.model_validate(post)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int, db: Session = Depends(get_db)):
    """Delete a post"""
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post not found: {post_id}"
        )

    db.delete(post)
    db.commit()

    return None


@router.post("/{post_id}/publish", response_model=PostResponse)
async def publish_post(post_id: int, db: Session = Depends(get_db)):
    """Mark a post as published"""
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post not found: {post_id}"
        )

    post.status = PostStatusEnum.PUBLISHED.value
    post.published_at = datetime.utcnow()

    db.commit()
    db.refresh(post)

    return PostResponse.model_validate(post)


@router.post("/{post_id}/archive", response_model=PostResponse)
async def archive_post(post_id: int, db: Session = Depends(get_db)):
    """Archive a post"""
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post not found: {post_id}"
        )

    post.status = PostStatusEnum.ARCHIVED.value

    db.commit()
    db.refresh(post)

    return PostResponse.model_validate(post)


@router.post("/{post_id}/export-to-file")
async def export_post_to_file(post_id: int, db: Session = Depends(get_db)):
    """Export a post to markdown file in the posts directory"""
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post not found: {post_id}"
        )

    # Create posts directory if it doesn't exist
    os.makedirs(POSTS_DIR, exist_ok=True)

    filename = f"{post.number}.{post.slug}.md"
    filepath = os.path.join(POSTS_DIR, filename)

    # Build markdown content
    content = f"""---
title: "{post.title}"
source: {post.source or "Manual"}
created_date: {post.created_at.strftime("%Y-%m-%d")}
status: {post.status}
content_type: {post.content_type or "N/A"}
cta_type: {post.cta_type or "N/A"}
target_audience: {post.target_audience or "N/A"}
key_topics: {", ".join(post.key_topics) if post.key_topics else "N/A"}
---

## Hook

{post.hook}

## Content

{post.content}
"""

    # Add image prompts if available
    if post.image_prompts:
        import json
        content += f"""

## Image Prompts

```json
{json.dumps(post.image_prompts, indent=2)}
```
"""

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    return {"message": f"Exported to {filename}", "path": filepath}


@router.post("/import-from-files", response_model=List[PostResponse])
async def import_posts_from_files(db: Session = Depends(get_db)):
    """Import posts from markdown files in the posts directory"""
    imported = []

    if not os.path.exists(POSTS_DIR):
        return imported

    for filename in os.listdir(POSTS_DIR):
        if not filename.endswith(".md"):
            continue

        filepath = os.path.join(POSTS_DIR, filename)

        # Parse filename: {number}.{slug}.md
        parts = filename[:-3].split(".", 1)
        if len(parts) != 2:
            continue

        try:
            number = int(parts[0])
        except ValueError:
            continue

        slug = parts[1]

        # Check if post already exists
        existing = db.query(Post).filter(Post.number == number).first()
        if existing:
            continue

        # Read and parse markdown file
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Basic parsing (you may want to improve this)
        title = slug.replace("-", " ").title()
        hook = ""
        post_content = content

        # Try to extract hook and content from markdown structure
        if "## Hook" in content and "## Content" in content:
            hook_start = content.index("## Hook") + 7
            content_start = content.index("## Content")
            hook = content[hook_start:content_start].strip()
            post_content = content[content_start + 10:].strip()

            # Remove image prompts section if present
            if "## Image Prompts" in post_content:
                post_content = post_content[:post_content.index("## Image Prompts")].strip()

        post = Post(
            number=number,
            title=title,
            slug=slug,
            hook=hook or "No hook",
            content=post_content,
            source="File Import",
            status=PostStatusEnum.DRAFTING.value
        )

        db.add(post)
        db.commit()
        db.refresh(post)
        imported.append(PostResponse.model_validate(post))

    return imported
