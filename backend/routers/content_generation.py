"""Content Generation API Router - v1.1"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import json

from database import get_db
from models.post import Post
from models.context_profile import ContextProfile
from schemas.content_generation import (
    TranscriptToPostRequest, QuestionsToPostRequest,
    ContentGenerationResponse, DISCOVERY_QUESTIONS,
    HookGenerationRequest, HookGenerationResponse, HookSuggestion
)
from schemas.post import PostStatusEnum
from services.content_generator import ContentGeneratorService

router = APIRouter()


def get_content_generator(db: Session = Depends(get_db)) -> ContentGeneratorService:
    """Get content generator service with loaded context"""
    return ContentGeneratorService(db)


@router.get("/discovery-questions")
async def get_discovery_questions():
    """Get the list of discovery questions for Q&A content generation"""
    return {
        "questions": DISCOVERY_QUESTIONS,
        "categories": list(set(q["category"] for q in DISCOVERY_QUESTIONS)),
        "instructions": """
Answer at least 3-5 of these questions to generate a LinkedIn post.
The more detailed your answers, the better the generated content will be.
Each answer should be at least 2-3 sentences for best results.
"""
    }


@router.post("/from-transcript", response_model=ContentGenerationResponse)
async def generate_from_transcript(
    request: TranscriptToPostRequest,
    save_to_db: bool = True,
    db: Session = Depends(get_db)
):
    """
    Generate a LinkedIn post from a transcript.

    This endpoint takes a transcript (from YouTube, podcast, sales call, meeting, etc.)
    and transforms it into a LinkedIn post using the brand context.
    """
    generator = ContentGeneratorService(db)

    try:
        result = await generator.generate_from_transcript(
            transcript=request.transcript,
            source_type=request.source_type,
            source_url=request.source_url,
            preferred_post_type=request.preferred_post_type,
            target_word_count=request.target_word_count
        )

        # Optionally save to database
        if save_to_db and result["success"]:
            post = generator.save_generated_post(result)
            result["post_id"] = post.id

        return ContentGenerationResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content generation failed: {str(e)}"
        )


@router.post("/from-questions", response_model=ContentGenerationResponse)
async def generate_from_questions(
    request: QuestionsToPostRequest,
    save_to_db: bool = True,
    db: Session = Depends(get_db)
):
    """
    Generate a LinkedIn post from Q&A responses.

    This endpoint takes user answers to discovery questions and generates
    a LinkedIn post based on their responses and the brand context.
    """
    generator = ContentGeneratorService(db)

    try:
        result = await generator.generate_from_questions(
            answers=request.answers,
            preferred_post_type=request.preferred_post_type,
            target_word_count=request.target_word_count
        )

        # Optionally save to database
        if save_to_db and result["success"]:
            post = generator.save_generated_post(result)
            result["post_id"] = post.id

        return ContentGenerationResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content generation failed: {str(e)}"
        )


@router.post("/hooks", response_model=HookGenerationResponse)
async def generate_hooks(
    request: HookGenerationRequest,
    db: Session = Depends(get_db)
):
    """
    Generate hook suggestions for a topic.

    Uses the Hook Mastery framework to generate scored hooks.
    """
    generator = ContentGeneratorService(db)

    try:
        hooks = await generator.generate_hooks(
            topic=request.topic,
            key_insight=request.key_insight,
            target_audience=request.target_audience,
            num_hooks=request.num_hooks
        )

        # Sort by score and get best
        sorted_hooks = sorted(hooks, key=lambda h: h["score"], reverse=True)
        best_hook = sorted_hooks[0] if sorted_hooks else None

        return HookGenerationResponse(
            hooks=[HookSuggestion(**h) for h in sorted_hooks],
            best_hook=HookSuggestion(**best_hook) if best_hook else None
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hook generation failed: {str(e)}"
        )


@router.post("/{post_id}/regenerate-hook", response_model=ContentGenerationResponse)
async def regenerate_hook(
    post_id: int,
    num_suggestions: int = 5,
    db: Session = Depends(get_db)
):
    """Regenerate hooks for an existing post"""
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post not found: {post_id}"
        )

    generator = ContentGeneratorService(db)

    try:
        # Extract key insight from content
        hooks = await generator.generate_hooks(
            topic=post.title,
            key_insight=post.content[:500],  # First 500 chars as context
            target_audience=post.target_audience,
            num_hooks=num_suggestions
        )

        return ContentGenerationResponse(
            success=True,
            post_id=post_id,
            title=post.title,
            hook=post.hook,
            content=post.content,
            post_type=post.content_type or "Unknown",
            word_count=len(post.content.split()),
            suggested_hooks=[h["hook"] for h in hooks]
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hook regeneration failed: {str(e)}"
        )


@router.get("/post-types")
async def get_post_types():
    """Get available post types with descriptions"""
    return {
        "types": [
            {
                "id": "Story-Based",
                "name": "Story-Based Post",
                "description": "For mistakes, wins, realizations. Uses narrative structure with emotional arc.",
                "best_for": ["Personal experiences", "Lessons learned", "Transformation stories"]
            },
            {
                "id": "Framework",
                "name": "Framework Post",
                "description": "For systems, processes, methodologies. Structured and actionable.",
                "best_for": ["How-to guides", "Step-by-step processes", "Mental models"]
            },
            {
                "id": "Contrarian Opinion",
                "name": "Contrarian Opinion Post",
                "description": "For hot takes, challenging status quo. Bold and thought-provoking.",
                "best_for": ["Industry critiques", "Myth-busting", "Alternative perspectives"]
            },
            {
                "id": "Case Study",
                "name": "Case Study Post",
                "description": "For client results and transformations. Data-driven and credibility-building.",
                "best_for": ["Client success stories", "Before/after comparisons", "Proof of results"]
            }
        ]
    }


@router.get("/context-summary")
async def get_context_summary(db: Session = Depends(get_db)):
    """Get a summary of loaded context profiles for content generation"""
    profiles = db.query(ContextProfile).filter(ContextProfile.is_active == 1).all()

    summary = {}
    for profile in profiles:
        profile_type = profile.profile_type
        data = profile.data

        # Handle case where data might be a JSON string instead of dict
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                continue

        if not isinstance(data, dict):
            continue

        if profile_type == "brand_voice":
            summary["brand_voice"] = {
                "tone": data.get("tone_descriptors", [])[:3],
                "reference_brands": data.get("reference_brands", [])[:3],
                "common_phrases": data.get("common_phrases", [])[:3]
            }
        elif profile_type == "business_context":
            # Handle core_offers - can be strings or objects with "name" key
            core_offers = data.get("core_offers", [])[:3]
            if core_offers and isinstance(core_offers[0], str):
                # Offers are strings - extract first part before " - "
                offers_list = [o.split(" - ")[0] if " - " in o else o for o in core_offers]
            else:
                # Offers are objects with "name" key
                offers_list = [o.get("name", "") if isinstance(o, dict) else str(o) for o in core_offers]

            summary["business"] = {
                "company": data.get("business_name", data.get("company_name", "")),
                "industry": data.get("industry", ""),
                "core_offers": offers_list
            }
        elif profile_type == "icp_context":
            summary["icp"] = {
                "primary": data.get("primary_icp", {}).get("description", ""),
                "pain_points": data.get("pain_points", [])[:3]
            }

    return {
        "profiles_loaded": len(profiles),
        "summary": summary,
        "ready_for_generation": len(profiles) >= 2
    }
