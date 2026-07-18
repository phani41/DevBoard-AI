from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from schemas.user import UserResponse


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"
    deadline: Optional[datetime] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None


class ProjectMemberAdd(BaseModel):
    user_id: int


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    status: str
    deadline: Optional[datetime] = None
    owner_id: int
    owner: Optional[UserResponse] = None
    members: List[UserResponse] = []
    task_count: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
