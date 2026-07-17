from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from models.rbac import ActivityLog


class ActivityService:
    """Service for tracking and retrieving activity logs."""

    @staticmethod
    def log(
        db: Session,
        action: str,
        user_id: Optional[int] = None,
        project_id: Optional[int] = None,
        task_id: Optional[int] = None,
        description: Optional[str] = None,
        metadata_json: Optional[dict] = None,
    ) -> ActivityLog:
        """Create a new activity log entry."""
        activity = ActivityLog(
            user_id=user_id,
            project_id=project_id,
            task_id=task_id,
            action=action,
            description=description,
            metadata_json=metadata_json,
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity

    @staticmethod
    def get_project_activities(
        db: Session,
        project_id: int,
        page: int = 1,
        per_page: int = 50,
    ) -> tuple[List[ActivityLog], int]:
        """Get activities for a specific project."""
        query = db.query(ActivityLog).filter(
            ActivityLog.project_id == project_id
        ).order_by(ActivityLog.created_at.desc())

        total = query.count()
        offset = (page - 1) * per_page
        activities = query.offset(offset).limit(per_page).all()

        return activities, total

    @staticmethod
    def get_user_activities(
        db: Session,
        user_id: int,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[List[ActivityLog], int]:
        """Get activities for a specific user."""
        query = db.query(ActivityLog).filter(
            ActivityLog.user_id == user_id
        ).order_by(ActivityLog.created_at.desc())

        total = query.count()
        offset = (page - 1) * per_page
        activities = query.offset(offset).limit(per_page).all()

        return activities, total

    @staticmethod
    def get_global_activities(
        db: Session,
        user_project_ids: List[int],
        page: int = 1,
        per_page: int = 50,
    ) -> tuple[List[ActivityLog], int]:
        """Get activities across multiple projects."""
        query = db.query(ActivityLog).filter(
            ActivityLog.project_id.in_(user_project_ids)
        ).order_by(ActivityLog.created_at.desc())

        total = query.count()
        offset = (page - 1) * per_page
        activities = query.offset(offset).limit(per_page).all()

        return activities, total

    ACTIONS = {
        "project_created": "created this project",
        "project_updated": "updated the project",
        "task_created": "created a task",
        "task_updated": "updated a task",
        "task_deleted": "deleted a task",
        "comment_added": "added a comment",
        "member_joined": "joined the project",
        "member_removed": "removed a member",
        "role_changed": "changed a role",
        "ai_generated": "used AI features",
        "password_reset": "reset their password",
        "invitation_sent": "sent an invitation",
        "invitation_accepted": "accepted an invitation",
        "attachment_uploaded": "uploaded a file",
        "ownership_transferred": "transferred ownership",
    }


activity_service = ActivityService()
