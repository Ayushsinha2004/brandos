"""Pydantic schemas for Content Generation API"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class PostTypeEnum(str, Enum):
    STORY = "Story-Based"
    FRAMEWORK = "Framework"
    CONTRARIAN = "Contrarian Opinion"
    CASE_STUDY = "Case Study"


class DiscoveryQuestion(BaseModel):
    """A single discovery question with answer"""
    question_id: str
    category: str
    question: str
    answer: str


# The 10 Discovery Questions for Q&A method
DISCOVERY_QUESTIONS = [
    # Category A: Experience & Story Mining
    {
        "id": "q1",
        "category": "Experience & Story Mining",
        "question": "What's the biggest win you've had in the last 90 days? Walk me through what happened and what made it work."
    },
    {
        "id": "q2",
        "category": "Experience & Story Mining",
        "question": "What's a mistake you made that taught you something valuable? What did you learn?"
    },
    {
        "id": "q3",
        "category": "Experience & Story Mining",
        "question": "What's a belief you hold that most people in your industry would disagree with? What evidence do you have?"
    },
    # Category B: Framework & Methodology Mining
    {
        "id": "q4",
        "category": "Framework & Methodology Mining",
        "question": "What's a process or system you've developed that consistently gets results? How does it work?"
    },
    {
        "id": "q5",
        "category": "Framework & Methodology Mining",
        "question": "What do you do differently than the conventional approach in your field? Why does it work better?"
    },
    {
        "id": "q6",
        "category": "Framework & Methodology Mining",
        "question": "What tool, technique, or resource do you wish you had known about earlier in your career?"
    },
    # Category C: Client & Case Study Mining
    {
        "id": "q7",
        "category": "Client & Case Study Mining",
        "question": "Tell me about a recent client success story. What was their situation before, what did you do, and what was the result?"
    },
    {
        "id": "q8",
        "category": "Client & Case Study Mining",
        "question": "What's the most common problem your clients come to you with? How do you typically solve it?"
    },
    {
        "id": "q9",
        "category": "Client & Case Study Mining",
        "question": "What solution or approach have you developed that you're most proud of? Why does it work so well?"
    },
    # Category D: Trend & Opinion Mining
    {
        "id": "q10",
        "category": "Trend & Opinion Mining",
        "question": "What trend are you seeing in your industry that most people aren't paying attention to? What are the implications?"
    }
]


class TranscriptToPostRequest(BaseModel):
    """Request for generating a LinkedIn post from a transcript"""
    transcript: str = Field(..., min_length=100, description="The transcript to convert to a post")
    source_type: Optional[str] = Field(None, description="Type of source: youtube, podcast, sales_call, meeting")
    source_url: Optional[str] = Field(None, description="URL of the source if available")
    preferred_post_type: Optional[PostTypeEnum] = None
    target_word_count: Optional[int] = Field(550, ge=400, le=700)


class QuestionsToPostRequest(BaseModel):
    """Request for generating a LinkedIn post from Q&A responses"""
    answers: List[DiscoveryQuestion] = Field(..., min_items=1, description="Answered discovery questions")
    preferred_post_type: Optional[PostTypeEnum] = None
    target_word_count: Optional[int] = Field(550, ge=400, le=700)


class ContentGenerationResponse(BaseModel):
    """Response from content generation"""
    success: bool
    post_id: Optional[int] = None
    title: str
    hook: str
    content: str
    post_type: str
    word_count: int
    key_insights: List[str] = []
    suggested_hooks: List[str] = []
    image_prompts: Optional[dict] = None
    message: Optional[str] = None


class HookSuggestion(BaseModel):
    """A suggested hook with scoring"""
    hook: str
    hook_type: str
    score: float = Field(..., ge=0, le=100)
    curiosity_gap: float = Field(..., ge=0, le=30)
    specificity: float = Field(..., ge=0, le=20)
    emotion: float = Field(..., ge=0, le=20)
    brevity: float = Field(..., ge=0, le=15)
    clarity: float = Field(..., ge=0, le=15)


class HookGenerationRequest(BaseModel):
    """Request for generating hooks"""
    topic: str
    key_insight: str
    target_audience: Optional[str] = None
    num_hooks: Optional[int] = Field(5, ge=1, le=10)


class HookGenerationResponse(BaseModel):
    """Response with generated hooks"""
    hooks: List[HookSuggestion]
    best_hook: HookSuggestion
