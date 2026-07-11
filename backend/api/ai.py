from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.user import User
from models.ai_history import AIHistory
from schemas.ai import (
    TaskBreakdownRequest,
    TaskBreakdownResponse,
    BugExplainRequest,
    BugExplainResponse,
    DocumentationRequest,
    DocumentationResponse,
    AIHistoryResponse,
)
from services.auth_service import get_current_user
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/ai", tags=["AI Features"])


def _save_history(
    db: Session,
    user_id: int | None,
    feature_type: str,
    input_text: str,
    output_text: str,
    metadata: dict | None = None,
):
    history = AIHistory(
        user_id=user_id,
        feature_type=feature_type,
        input_text=input_text,
        output_text=output_text,
        metadata=metadata,
    )
    db.add(history)
    db.commit()


@router.post("/task-breakdown", response_model=TaskBreakdownResponse)
def task_breakdown(
    request: TaskBreakdownRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = gemini_service.task_breakdown(request.task_title, request.description)

    _save_history(
        db=db,
        user_id=current_user.id,
        feature_type="task_breakdown",
        input_text=f"Task: {request.task_title}\nDescription: {request.description or ''}",
        output_text=str(result),
    )

    return TaskBreakdownResponse(**result)


@router.post("/bug-explain", response_model=BugExplainResponse)
def explain_bug(
    request: BugExplainRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = gemini_service.explain_bug(request.error_message, request.code_context)

    _save_history(
        db=db,
        user_id=current_user.id,
        feature_type="bug_explain",
        input_text=f"Error: {request.error_message}\nCode: {request.code_context or ''}",
        output_text=str(result),
    )

    return BugExplainResponse(**result)


@router.post("/documentation", response_model=DocumentationResponse)
def generate_documentation(
    request: DocumentationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = gemini_service.generate_documentation(
        project_name=request.project_name,
        description=request.description,
        features=request.features,
        doc_type=request.doc_type,
    )

    _save_history(
        db=db,
        user_id=current_user.id,
        feature_type="documentation",
        input_text=f"Doc type: {request.doc_type}\nProject: {request.project_name}",
        output_text=content,
        metadata={"doc_type": request.doc_type},
    )

    return DocumentationResponse(content=content, doc_type=request.doc_type)


@router.get("/history", response_model=list[AIHistoryResponse])
def get_ai_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = (
        db.query(AIHistory)
        .filter(AIHistory.user_id == current_user.id)
        .order_by(AIHistory.created_at.desc())
        .limit(50)
        .all()
    )
    return [AIHistoryResponse.model_validate(h) for h in history]


@router.get("/history/{history_id}", response_model=AIHistoryResponse)
def get_ai_history_item(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = (
        db.query(AIHistory)
        .filter(AIHistory.id == history_id, AIHistory.user_id == current_user.id)
        .first()
    )
    if not history:
        raise HTTPException(status_code=404, detail="History item not found")
    return AIHistoryResponse.model_validate(history)
