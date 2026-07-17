from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base
import enum


class ProjectRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


class ProjectMemberRole(Base):
    __tablename__ = "project_member_roles"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(SAEnum(ProjectRole), default=ProjectRole.MEMBER, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", backref="role_assignments")
    user = relationship("User", backref="project_roles")


class Invitation(Base):
    __tablename__ = "project_invitations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    role = Column(SAEnum(ProjectRole), default=ProjectRole.MEMBER, nullable=False)
    token = Column(String(500), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    status = Column(String(50), default="pending")  # pending, accepted, declined, cancelled, expired
    inviter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", backref="invitations")
    inviter = relationship("User", backref="sent_invitations")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(100), nullable=False)  # task_assigned, comment_added, due_date_reminder, invitation, project_update, password_changed
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=True)
    link = Column(String(500), nullable=True)
    is_read = Column(Integer, default=0, server_default="0")
    metadata_json = Column(String(2000), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="notifications")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)  # project_created, task_created, task_updated, task_deleted, comment_added, member_joined, role_changed, ai_generated, password_reset
    description = Column(String(500), nullable=True)
    metadata_json = Column(String(2000), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", backref="activities")
    project = relationship("Project", backref="activities")
    task = relationship("Task", backref="activities")
