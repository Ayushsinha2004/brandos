"""Pydantic schemas for Image Generation API"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class ImageStyleEnum(str, Enum):
    TECHNICAL = "technical"
    APPLE = "apple"
    BUSINESS_RESULTS = "business_results"


class ImageGenerateRequest(BaseModel):
    """Request for generating images for a post"""
    post_id: int = Field(..., description="ID of the post to generate images for")
    styles: Optional[List[ImageStyleEnum]] = Field(
        None,
        description="Specific styles to generate. If not provided, generates all 3 styles"
    )
    dry_run: Optional[bool] = Field(False, description="If true, returns prompts without generating images")


class ImagePromptValidation(BaseModel):
    """Validation result for image prompts"""
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []


class GeneratedImage(BaseModel):
    """A single generated image"""
    style: str
    file_path: str
    prompt: str
    width: int = 1200
    height: int = 1200


class ImageGenerateResponse(BaseModel):
    """Response from image generation"""
    success: bool
    post_id: int
    images: List[GeneratedImage] = []
    prompts_only: Optional[dict] = None  # For dry-run mode
    message: Optional[str] = None
    errors: List[str] = []


class ImagePromptContext(BaseModel):
    """Context extracted from post for image generation"""
    post_reference: str
    created_date: str
    hook_text: str
    key_insight: str
    result_metrics: Optional[str] = None
    key_topics: List[str] = []


class ImagePromptMeta(BaseModel):
    """Metadata for image generation"""
    platform: str = "LinkedIn"
    aspect_ratio: str = "1:1"
    dimensions: str = "1200x1200px"


class ImagePromptBaseStyle(BaseModel):
    """Base style configuration - MUST have white background"""
    background: str = "pure white (#FFFFFF)"
    max_colors: int = 3
    typography: str = "clean, modern sans-serif"
    layout: str = "balanced composition with clear focal point"


class ImageStyleVariation(BaseModel):
    """A single style variation prompt"""
    style_name: str
    visual_concept: str
    prompt: str


class FullImagePromptStructure(BaseModel):
    """Complete image prompt structure (Nano Banana Format)"""
    post_context: ImagePromptContext
    meta: ImagePromptMeta
    base_style: ImagePromptBaseStyle
    variations: List[ImageStyleVariation]
