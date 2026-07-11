from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class ChecklistItem(BaseModel):
    text: str
    completed: bool = False


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    status: str = "todo"
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None
    project_id: int
    labels: List[str] = []
    checklist: List[ChecklistItem] = []
    position: int = 0


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None
    labels: Optional[List[str]] = None
    checklist: Optional[List[ChecklistItem]] = None
    position: Optional[int] = None


class TaskReorder(BaseModel):
    task_id: int
    status: str
    position: int


class UserBrief(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None
    assignee: Optional[UserBrief] = None
    project_id: int
    labels: List[str] = []
    checklist: List[Any] = []
    position: int
    comment_count: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
