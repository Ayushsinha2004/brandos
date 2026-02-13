"""Pydantic schemas for Context Profile API"""

from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


class ProfileTypeEnum(str, Enum):
    BRAND_VOICE = "brand_voice"
    BUSINESS_CONTEXT = "business_context"
    ICP_CONTEXT = "icp_context"
    MARKETING_STRATEGY = "marketing_strategy"
    PERSONAL_STORY = "personal_story"


class ContextProfileCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    profile_type: ProfileTypeEnum
    version: Optional[str] = "v1"
    description: Optional[str] = None
    data: dict = Field(..., description="The profile data as JSON")
    is_active: Optional[bool] = True


class ContextProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    version: Optional[str] = None
    description: Optional[str] = None
    data: Optional[dict] = None
    is_active: Optional[bool] = None


class ContextProfileResponse(BaseModel):
    id: int
    name: str
    profile_type: str
    version: str
    description: Optional[str]
    data: dict
    is_active: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContextProfileListResponse(BaseModel):
    profiles: List[ContextProfileResponse]
    total: int


# Brand Voice specific schemas
class BrandVoiceData(BaseModel):
    tone_descriptors: List[str] = []
    personality_traits: List[str] = []
    language_rules: dict = {}
    persuasion_techniques: List[str] = []
    common_phrases: List[str] = []
    phrases_to_avoid: List[str] = []
    reference_brands: List[str] = []


# Business Context specific schemas
class BusinessContextData(BaseModel):
    company_name: str = ""
    founder_name: str = ""
    website: str = ""
    industry: str = ""
    business_model: str = ""
    core_offers: List[dict] = []
    revenue_streams: dict = {}
    target_markets: List[str] = []
    current_status: dict = {}
    key_constraints: List[str] = []
    distribution_channels: dict = {}
    unit_economics: dict = {}


# ICP Context specific schemas
class ICPContextData(BaseModel):
    primary_icp: dict = {}
    secondary_icp: dict = {}
    pain_points: List[str] = []
    decision_making_patterns: List[str] = []
    behavioral_characteristics: List[str] = []
    objections: List[str] = []


# Marketing Strategy specific schemas
class MarketingStrategyData(BaseModel):
    marketing_funnels: List[dict] = []
    customer_journey: dict = {}
    channel_strategy: dict = {}
    messaging_frameworks: List[dict] = []
    content_pillars: List[str] = []


# Personal Story specific schemas
class PersonalStoryData(BaseModel):
    founder_journey: str = ""
    origin_narrative: str = ""
    positioning_narrative: str = ""
    authentication_story: str = ""
    key_milestones: List[dict] = []
    lessons_learned: List[str] = []
