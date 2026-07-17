from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from database.connection import get_db
from models.user import User
from models.user_profile import UserProfile
from schemas.profile import UserProfileResponse, UserProfileUpdate, ChangePasswordRequest
from schemas.user import UserResponse
from services.auth_service import get_current_user, get_password_hash, verify_password
from services.activity_service import activity_service
import os
import uuid
import mimetypes

router = APIRouter(prefix="/api/profile", tags=["Profile"])

ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB
AVATAR_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "avatars")


def get_or_create_profile(db: Session, user: User) -> UserProfile:
    """Get or create a user profile."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("", response_model=UserProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the current user's profile."""
    profile = get_or_create_profile(db, current_user)
    return profile


@router.put("", response_model=UserProfileResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's profile."""
    profile = get_or_create_profile(db, current_user)

    update_dict = profile_data.model_dump(exclude_unset=True, exclude_none=True)
    for field, value in update_dict.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/avatar", response_model=UserProfileResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a profile avatar."""
    content_type = file.content_type or "image/png"

    if content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, GIF, and WebP images are allowed",
        )

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Avatar size must be less than 5MB",
        )

    # Save avatar
    os.makedirs(AVATAR_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "avatar.png")[1]
    avatar_name = f"{uuid.uuid4().hex}{ext}"
    avatar_path = os.path.join(AVATAR_DIR, avatar_name)

    content = await file.read()
    with open(avatar_path, "wb") as f:
        f.write(content)

    # Update profile
    profile = get_or_create_profile(db, current_user)
    profile.avatar_storage_path = avatar_path
    current_user.avatar_url = f"/uploads/avatars/{avatar_name}"
    db.commit()
    db.refresh(profile)

    return profile


@router.put("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    password_data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change the current user's password."""
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match",
        )

    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long",
        )

    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()

    activity_service.log(
        db=db,
        action="password_reset",
        user_id=current_user.id,
        description="Changed their password",
    )

    return {"message": "Password changed successfully"}


@router.get("/users", response_model=UserResponse)
def get_user_public(
    user_id: int,
    db: Session = Depends(get_db),
):
    """Get a user's public profile."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
