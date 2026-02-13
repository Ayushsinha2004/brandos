"""Image Generation API Router"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from database import get_db
from models.post import Post, PostImage
from schemas.image_generation import (
    ImageGenerateRequest, ImageGenerateResponse,
    ImageStyleEnum, GeneratedImage, ImagePromptValidation,
    FullImagePromptStructure
)
from services.image_generator import ImageGeneratorService
from config import get_settings

router = APIRouter()
settings = get_settings()

# Path to images directory
IMAGES_DIR = settings.images_dir


@router.post("/generate", response_model=ImageGenerateResponse)
async def generate_images(
    request: ImageGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Generate images for a post.

    Generates up to 3 image variations (technical, apple, business_results style)
    using OpenAI's image generation API.
    """
    post = db.query(Post).filter(Post.id == request.post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post not found: {request.post_id}"
        )

    if not post.image_prompts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post does not have image prompts. Generate prompts first."
        )

    generator = ImageGeneratorService(db)

    try:
        # Determine which styles to generate
        styles = request.styles or [ImageStyleEnum.TECHNICAL, ImageStyleEnum.APPLE, ImageStyleEnum.BUSINESS_RESULTS]

        if request.dry_run:
            # Return prompts without generating
            prompts = generator.get_prompts_for_styles(post, [s.value for s in styles])
            return ImageGenerateResponse(
                success=True,
                post_id=post.id,
                prompts_only=prompts,
                message="Dry run - prompts extracted without image generation"
            )

        # Generate images
        results = await generator.generate_images(post, [s.value for s in styles])

        images = []
        errors = []

        for style, result in results.items():
            if result.get("success"):
                images.append(GeneratedImage(
                    style=style,
                    file_path=result["file_path"],
                    prompt=result["prompt"]
                ))

                # Save to database
                post_image = PostImage(
                    post_id=post.id,
                    style=style,
                    file_path=result["file_path"],
                    prompt=result["prompt"]
                )
                db.add(post_image)
            else:
                errors.append(f"{style}: {result.get('error', 'Unknown error')}")

        db.commit()

        return ImageGenerateResponse(
            success=len(images) > 0,
            post_id=post.id,
            images=images,
            errors=errors,
            message=f"Generated {len(images)} images" + (f" with {len(errors)} errors" if errors else "")
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image generation failed: {str(e)}"
        )


@router.post("/{post_id}/generate-prompts")
async def generate_image_prompts(
    post_id: int,
    db: Session = Depends(get_db)
):
    """
    Generate image prompts for a post.

    Creates the JSON prompt structure needed for image generation
    based on the post's content.
    """
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post not found: {post_id}"
        )

    generator = ImageGeneratorService(db)

    try:
        prompts = generator.generate_prompts(post)

        # Save to post
        post.image_prompts = prompts
        db.commit()

        return {
            "success": True,
            "post_id": post_id,
            "prompts": prompts
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prompt generation failed: {str(e)}"
        )


@router.post("/{post_id}/validate-prompts", response_model=ImagePromptValidation)
async def validate_image_prompts(
    post_id: int,
    db: Session = Depends(get_db)
):
    """
    Validate image prompts for a post.

    Checks that the prompt structure is correct and includes required elements
    like white background specification.
    """
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post not found: {post_id}"
        )

    if not post.image_prompts:
        return ImagePromptValidation(
            is_valid=False,
            errors=["No image prompts found for this post"]
        )

    generator = ImageGeneratorService(db)
    validation = generator.validate_prompts(post.image_prompts)

    return ImagePromptValidation(**validation)


@router.get("/{post_id}/images")
async def get_post_images(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Get all generated images for a post"""
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post not found: {post_id}"
        )

    images = db.query(PostImage).filter(PostImage.post_id == post_id).all()

    return {
        "post_id": post_id,
        "post_title": post.title,
        "images": [
            {
                "id": img.id,
                "style": img.style,
                "file_path": img.file_path,
                "image_url": f"/images/{os.path.basename(img.file_path)}",
                "prompt": img.prompt,
                "created_at": img.created_at
            }
            for img in images
        ]
    }


@router.get("/file/{image_id}")
async def get_image_file(
    image_id: int,
    db: Session = Depends(get_db)
):
    """Serve an image file"""
    image = db.query(PostImage).filter(PostImage.id == image_id).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Image not found: {image_id}"
        )

    if not os.path.exists(image.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Image file not found on disk"
        )

    return FileResponse(image.file_path)


@router.delete("/{image_id}")
async def delete_image(
    image_id: int,
    delete_file: bool = True,
    db: Session = Depends(get_db)
):
    """Delete an image"""
    image = db.query(PostImage).filter(PostImage.id == image_id).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Image not found: {image_id}"
        )

    # Optionally delete file
    if delete_file and os.path.exists(image.file_path):
        os.remove(image.file_path)

    db.delete(image)
    db.commit()

    return {"message": "Image deleted", "id": image_id}


@router.get("/styles")
async def get_image_styles():
    """Get available image styles with descriptions"""
    return {
        "styles": [
            {
                "id": "technical",
                "name": "Technical Style",
                "description": "Clean flowcharts, system diagrams. Monospace typography. Engineering/IDE inspired aesthetic.",
                "colors": ["Deep blue accents", "Dark text", "Light grid lines"],
                "best_for": ["Process explanations", "System architectures", "Technical concepts"]
            },
            {
                "id": "apple",
                "name": "Apple Style",
                "description": "Ultra-minimal, premium aesthetic. Single focal point with subtle shadows.",
                "colors": ["Near-black text", "Space gray accents", "White background"],
                "best_for": ["Key insights", "Bold statements", "Premium positioning"]
            },
            {
                "id": "business_results",
                "name": "Business Results Style",
                "description": "Metrics and numbers as hero elements. Before/After comparisons.",
                "colors": ["Green for success", "Black for emphasis", "White background"],
                "best_for": ["Case studies", "ROI demonstrations", "Performance metrics"]
            }
        ]
    }
