from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.user import User
from schemas.notification import NotificationResponse, NotificationListResponse, NotificationMarkRead
from services.auth_service import get_current_user
from services.notification_service import notification_service

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def get_notifications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get notifications for the current user."""
    notifications, total, unread_count = notification_service.get_user_notifications(
        db, current_user.id, page, per_page, unread_only
    )

    return NotificationListResponse(
        notifications=[
            NotificationResponse(
                id=n.id,
                user_id=n.user_id,
                type=n.type,
                title=n.title,
                message=n.message,
                link=n.link,
                is_read=bool(n.is_read),
                metadata_json=n.metadata_json,
                created_at=n.created_at,
            )
            for n in notifications
        ],
        unread_count=unread_count,
        total=total,
    )


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get unread notification count."""
    count = notification_service.get_unread_count(db, current_user.id)
    return {"unread_count": count}


@router.put("/mark-read", status_code=status.HTTP_200_OK)
def mark_notifications_read(
    mark_data: NotificationMarkRead,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark specific notifications as read."""
    updated = notification_service.mark_as_read(db, mark_data.notification_ids, current_user.id)
    return {"updated": updated, "message": f"{updated} notifications marked as read"}


@router.put("/mark-all-read", status_code=status.HTTP_200_OK)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read."""
    updated = notification_service.mark_all_as_read(db, current_user.id)
    return {"updated": updated, "message": f"{updated} notifications marked as read"}
