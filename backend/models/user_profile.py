from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    timezone = Column(String(100), default="UTC")
    avatar_storage_path = Column(String(1000), nullable=True)
    notification_preferences = Column(JSON, default=lambda: {
        "task_assigned": True,
        "comment_added": True,
        "due_date_reminder": True,
        "invitation": True,
        "project_update": True,
        "password_changed": True,
    })
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="profile", uselist=False)
