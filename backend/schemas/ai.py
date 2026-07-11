from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class TaskBreakdownRequest(BaseModel):
    task_title: str
    description: Optional[str] = None


class TaskBreakdownResponse(BaseModel):
    subtasks: List[str]
    explanation: str


class BugExplainRequest(BaseModel):
    error_message: str
    code_context: Optional[str] = None


class BugExplainResponse(BaseModel):
    problem: str
    root_cause: str
    solution: str


class DocumentationRequest(BaseModel):
    project_name: str
    description: str
    features: List[str]
    doc_type: str = "readme"


class DocumentationResponse(BaseModel):
    content: str
    doc_type: str


class AIHistoryResponse(BaseModel):
    id: int
    feature_type: str
    input_text: str
    output_text: str
    metadata: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
