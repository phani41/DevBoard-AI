from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime


class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    bio: Optional[str] = None
    timezone: str = "UTC"
    avatar_storage_path: Optional[str] = None
    notification_preferences: Dict = {}
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    bio: Optional[str] = None
    timezone: Optional[str] = None
    notification_preferences: Optional[Dict] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str
