from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: Optional[str] = None
    link: Optional[str] = None
    is_read: bool
    metadata_json: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    unread_count: int
    total: int


class NotificationMarkRead(BaseModel):
    notification_ids: List[int]
