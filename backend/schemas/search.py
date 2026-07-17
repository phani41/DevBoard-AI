from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class SearchFilter(BaseModel):
    project_id: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


class SearchRequest(BaseModel):
    query: str = ""
    filters: Optional[SearchFilter] = None
    page: int = 1
    per_page: int = 20


class SearchResult(BaseModel):
    id: int
    type: str  # project, task, comment, member, ai_history
    title: str
    description: Optional[str] = None
    link: str
    metadata: Optional[Any] = None
    score: float = 0.0


class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
    page: int
    per_page: int
