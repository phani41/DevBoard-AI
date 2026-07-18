from sqlalchemy.orm import Session
from typing import Optional, List
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


activity_service = ActivityService()
