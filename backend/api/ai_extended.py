from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.user import User
from models.ai_history import AIHistory
from schemas.ai_extended import (
    SprintPlanRequest,
    SprintPlanResponse,
    ProjectSummaryRequest,
    ProjectSummaryResponse,
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    TaskPrioritizationRequest,
    TaskPrioritizationResponse,
)
from services.auth_service import get_current_user
from services.openrouter_service_extended import openrouter_extended

router = APIRouter(prefix="/api/ai", tags=["AI Extended Features"])


def _save_history(
    db: Session,
    user_id: int,
    feature_type: str,
    input_text: str,
    output_text: str,
    metadata_json: dict | None = None,
):
    """Save AI interaction to history."""
    history = AIHistory(
        user_id=user_id,
        feature_type=feature_type,
        input_text=input_text,
        output_text=output_text,
        metadata_json=metadata_json,
    )
    db.add(history)
    db.commit()


@router.post("/sprint-plan", response_model=SprintPlanResponse)
def sprint_plan(
    request: SprintPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate an AI-powered sprint plan."""
    try:
        result = openrouter_extended.sprint_planner(
            project_name=request.project_name,
            project_description=request.project_description,
            tasks=request.tasks,
            sprint_duration_days=request.sprint_duration_days,
            team_size=request.team_size,
        )

        _save_history(
            db=db,
            user_id=current_user.id,
            feature_type="sprint_plan",
            input_text=f"Project: {request.project_name}\nTasks: {len(request.tasks)} tasks\nDuration: {request.sprint_duration_days} days",
            output_text=str(result),
            metadata_json={"project_name": request.project_name},
        )

        return SprintPlanResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/project-summary", response_model=ProjectSummaryResponse)
def project_summary(
    request: ProjectSummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate an AI project summary with insights."""
    try:
        result = openrouter_extended.project_summary(
            project_name=request.project_name,
            description=request.project_description,
            features=request.features,
            stats=request.stats,
        )

        _save_history(
            db=db,
            user_id=current_user.id,
            feature_type="project_summary",
            input_text=f"Project: {request.project_name}\nFeatures: {len(request.features)} features",
            output_text=str(result),
            metadata_json={"project_name": request.project_name},
        )

        return ProjectSummaryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/risk-analysis", response_model=RiskAnalysisResponse)
def risk_analysis(
    request: RiskAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze project risks with AI."""
    try:
        result = openrouter_extended.risk_analysis(
            project_name=request.project_name,
            description=request.project_description,
            tasks=request.tasks,
            current_status=request.current_status,
        )

        _save_history(
            db=db,
            user_id=current_user.id,
            feature_type="risk_analysis",
            input_text=f"Project: {request.project_name}\nTasks: {len(request.tasks)} tasks",
            output_text=str(result),
            metadata_json={"project_name": request.project_name},
        )

        return RiskAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/task-prioritization", response_model=TaskPrioritizationResponse)
def task_prioritization(
    request: TaskPrioritizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Prioritize tasks using AI."""
    try:
        result = openrouter_extended.task_prioritization(
            tasks=request.tasks,
            criteria=request.criteria,
        )

        _save_history(
            db=db,
            user_id=current_user.id,
            feature_type="task_prioritization",
            input_text=f"Tasks: {len(request.tasks)} tasks\nCriteria: {request.criteria or 'Default'}",
            output_text=str(result),
        )

        return TaskPrioritizationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
