"""Context Profiles API Router"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os

from database import get_db
from models.context_profile import ContextProfile
from schemas.context_profile import (
    ContextProfileCreate, ContextProfileUpdate, ContextProfileResponse,
    ContextProfileListResponse, ProfileTypeEnum
)
from config import get_settings

router = APIRouter()
settings = get_settings()

# Path to existing context files
CONTEXT_DIR = settings.context_dir


@router.get("/", response_model=ContextProfileListResponse)
async def list_profiles(
    profile_type: Optional[ProfileTypeEnum] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """List all context profiles, optionally filtered by type"""
    query = db.query(ContextProfile)

    if profile_type:
        query = query.filter(ContextProfile.profile_type == profile_type.value)

    if active_only:
        query = query.filter(ContextProfile.is_active == 1)

    profiles = query.all()

    return ContextProfileListResponse(
        profiles=[ContextProfileResponse.model_validate(p) for p in profiles],
        total=len(profiles)
    )


@router.get("/types", response_model=List[str])
async def list_profile_types():
    """List all available profile types"""
    return [pt.value for pt in ProfileTypeEnum]


@router.get("/active/{profile_type}", response_model=ContextProfileResponse)
async def get_active_profile(
    profile_type: ProfileTypeEnum,
    db: Session = Depends(get_db)
):
    """Get the active profile for a specific type"""
    profile = db.query(ContextProfile).filter(
        ContextProfile.profile_type == profile_type.value,
        ContextProfile.is_active == 1
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active profile found for type: {profile_type.value}"
        )

    return ContextProfileResponse.model_validate(profile)


@router.get("/{profile_id}", response_model=ContextProfileResponse)
async def get_profile(profile_id: int, db: Session = Depends(get_db)):
    """Get a specific context profile by ID"""
    profile = db.query(ContextProfile).filter(ContextProfile.id == profile_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found: {profile_id}"
        )

    return ContextProfileResponse.model_validate(profile)


@router.post("/", response_model=ContextProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    profile_data: ContextProfileCreate,
    db: Session = Depends(get_db)
):
    """Create a new context profile"""
    # If this is set as active, deactivate other profiles of the same type
    if profile_data.is_active:
        db.query(ContextProfile).filter(
            ContextProfile.profile_type == profile_data.profile_type.value
        ).update({"is_active": 0})

    profile = ContextProfile(
        name=profile_data.name,
        profile_type=profile_data.profile_type.value,
        version=profile_data.version,
        description=profile_data.description,
        data=profile_data.data,
        is_active=1 if profile_data.is_active else 0
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return ContextProfileResponse.model_validate(profile)


@router.put("/{profile_id}", response_model=ContextProfileResponse)
async def update_profile(
    profile_id: int,
    profile_data: ContextProfileUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing context profile"""
    profile = db.query(ContextProfile).filter(ContextProfile.id == profile_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found: {profile_id}"
        )

    # Update fields if provided
    update_data = profile_data.model_dump(exclude_unset=True)

    # Handle is_active specially
    if "is_active" in update_data:
        if update_data["is_active"]:
            # Deactivate other profiles of the same type
            db.query(ContextProfile).filter(
                ContextProfile.profile_type == profile.profile_type,
                ContextProfile.id != profile_id
            ).update({"is_active": 0})
        update_data["is_active"] = 1 if update_data["is_active"] else 0

    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    return ContextProfileResponse.model_validate(profile)


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(profile_id: int, db: Session = Depends(get_db)):
    """Delete a context profile"""
    profile = db.query(ContextProfile).filter(ContextProfile.id == profile_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found: {profile_id}"
        )

    db.delete(profile)
    db.commit()

    return None


@router.post("/import-from-files", response_model=List[ContextProfileResponse])
async def import_from_files(db: Session = Depends(get_db)):
    """Import existing context profiles from JSON files in the context directory"""
    imported = []

    profile_mapping = {
        "v1-brand_voice.json": ("Brand Voice", "brand_voice"),
        "v1-business-context.json": ("Business Context", "business_context"),
        "v1-icp_context.json": ("ICP Context", "icp_context"),
        "v1-marketing_strategy.json": ("Marketing Strategy", "marketing_strategy"),
        "v1-personal_story.json": ("Personal Story", "personal_story"),
    }

    for filename, (name, profile_type) in profile_mapping.items():
        filepath = os.path.join(CONTEXT_DIR, filename)

        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Check if profile already exists
            existing = db.query(ContextProfile).filter(
                ContextProfile.profile_type == profile_type,
                ContextProfile.version == "v1"
            ).first()

            if existing:
                # Update existing
                existing.data = data
                db.commit()
                db.refresh(existing)
                imported.append(ContextProfileResponse.model_validate(existing))
            else:
                # Create new
                profile = ContextProfile(
                    name=name,
                    profile_type=profile_type,
                    version="v1",
                    description=f"Imported from {filename}",
                    data=data,
                    is_active=1
                )
                db.add(profile)
                db.commit()
                db.refresh(profile)
                imported.append(ContextProfileResponse.model_validate(profile))

    return imported


@router.post("/{profile_id}/export-to-file")
async def export_to_file(profile_id: int, db: Session = Depends(get_db)):
    """Export a context profile back to its JSON file"""
    profile = db.query(ContextProfile).filter(ContextProfile.id == profile_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found: {profile_id}"
        )

    # Determine filename based on profile type
    filename_mapping = {
        "brand_voice": "v1-brand_voice.json",
        "business_context": "v1-business-context.json",
        "icp_context": "v1-icp_context.json",
        "marketing_strategy": "v1-marketing_strategy.json",
        "personal_story": "v1-personal_story.json",
    }

    filename = filename_mapping.get(profile.profile_type)
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown profile type: {profile.profile_type}"
        )

    filepath = os.path.join(CONTEXT_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(profile.data, f, indent=2, ensure_ascii=False)

    return {"message": f"Exported to {filename}", "path": filepath}
