from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ActivityLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    project_id: Optional[int] = None
    task_id: Optional[int] = None
    action: str
    description: Optional[str] = None
    metadata_json: Optional[Any] = None
    created_at: datetime
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None

    class Config:
        from_attributes = True


class ActivityTimelineResponse(BaseModel):
    activities: list["ActivityLogResponse"]
    total: int
    page: int
    per_page: int
