from sqlalchemy.orm import Session
from typing import Optional, List
from models.rbac import Notification


class NotificationService:
    """Service for creating and managing user notifications."""

    @staticmethod
    def create(
        db: Session,
        user_id: int,
        type: str,
        title: str,
        message: Optional[str] = None,
        link: Optional[str] = None,
        metadata_json: Optional[dict] = None,
    ) -> Notification:
        """Create a new notification."""
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            link=link,
            metadata_json=metadata_json,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: int,
        page: int = 1,
        per_page: int = 20,
        unread_only: bool = False,
    ) -> tuple[List[Notification], int, int]:
        """Get notifications for a user."""
        query = db.query(Notification).filter(Notification.user_id == user_id)

        if unread_only:
            query = query.filter(Notification.is_read == 0)

        total = query.count()
        unread_count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == 0,
        ).count()

        query = query.order_by(Notification.created_at.desc())
        offset = (page - 1) * per_page
        notifications = query.offset(offset).limit(per_page).all()

        return notifications, total, unread_count

    @staticmethod
    def mark_as_read(db: Session, notification_ids: List[int], user_id: int) -> int:
        """Mark notifications as read."""
        updated = db.query(Notification).filter(
            Notification.id.in_(notification_ids),
            Notification.user_id == user_id,
        ).update({"is_read": 1}, synchronize_session=False)

        db.commit()
        return updated

    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        """Mark all notifications as read."""
        updated = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == 0,
        ).update({"is_read": 1}, synchronize_session=False)

        db.commit()
        return updated

    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        """Get unread notification count."""
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == 0,
        ).count()


notification_service = NotificationService()
