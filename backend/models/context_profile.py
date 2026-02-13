"""Context Profile model for storing brand context"""

from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime

from database import Base


class ContextProfile(Base):
    __tablename__ = "context_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    profile_type = Column(String(50), nullable=False, index=True)
    # Types: brand_voice, business_context, icp_context, marketing_strategy, personal_story

    version = Column(String(20), default="v1")
    description = Column(Text, nullable=True)

    # The actual profile data as JSON
    data = Column(JSON, nullable=False)

    # Is this the active profile for this type?
    is_active = Column(Integer, default=1)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
