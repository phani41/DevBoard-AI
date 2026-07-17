from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.user import User
from models.project import Project
from schemas.activity import ActivityLogResponse, ActivityTimelineResponse
from services.auth_service import get_current_user
from services.activity_service import activity_service
from services.rbac_service import rbac_service

router = APIRouter(prefix="/api/activity", tags=["Activity"])


@router.get("/project/{project_id}", response_model=ActivityTimelineResponse)
def get_project_activity(
    project_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get activity timeline for a specific project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "project:view")

    activities, total = activity_service.get_project_activities(db, project_id, page, per_page)

    return ActivityTimelineResponse(
        activities=[
            ActivityLogResponse(
                id=a.id,
                user_id=a.user_id,
                project_id=a.project_id,
                task_id=a.task_id,
                action=a.action,
                description=a.description,
                metadata_json=a.metadata_json,
                created_at=a.created_at,
                user_name=a.user.username if a.user else None,
                user_avatar=a.user.avatar_url if a.user else None,
            )
            for a in activities
        ],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/global", response_model=ActivityTimelineResponse)
def get_global_activity(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get activity timeline across all user's projects."""
    # Get all project IDs the user is a member of
    user_projects = db.query(Project).filter(
        (Project.owner_id == current_user.id) |
        (Project.members.any(id=current_user.id))
    ).all()

    project_ids = [p.id for p in user_projects]
    if not project_ids:
        return ActivityTimelineResponse(activities=[], total=0, page=page, per_page=per_page)

    activities, total = activity_service.get_global_activities(db, project_ids, page, per_page)

    return ActivityTimelineResponse(
        activities=[
            ActivityLogResponse(
                id=a.id,
                user_id=a.user_id,
                project_id=a.project_id,
                task_id=a.task_id,
                action=a.action,
                description=a.description,
                metadata_json=a.metadata_json,
                created_at=a.created_at,
                user_name=a.user.username if a.user else None,
                user_avatar=a.user.avatar_url if a.user else None,
            )
            for a in activities
        ],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/user", response_model=ActivityTimelineResponse)
def get_user_activity(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get activity timeline for the current user."""
    activities, total = activity_service.get_user_activities(db, current_user.id, page, per_page)

    return ActivityTimelineResponse(
        activities=[
            ActivityLogResponse(
                id=a.id,
                user_id=a.user_id,
                project_id=a.project_id,
                task_id=a.task_id,
                action=a.action,
                description=a.description,
                metadata_json=a.metadata_json,
                created_at=a.created_at,
                user_name=a.user.username if a.user else None,
                user_avatar=a.user.avatar_url if a.user else None,
            )
            for a in activities
        ],
        total=total,
        page=page,
        per_page=per_page,
    )
