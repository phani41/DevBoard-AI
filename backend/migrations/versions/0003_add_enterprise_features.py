"""add enterprise features: rbac, invitations, notifications, activity_logs, attachments, user_profiles

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-17 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum type idempotently (PostgreSQL 9.3+)
    op.execute("CREATE TYPE IF NOT EXISTS projectrole AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')")

    # Project Member Roles (RBAC) — create_type=False because we created the type above
    op.create_table(
        "project_member_roles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.Enum("OWNER", "ADMIN", "MEMBER", "VIEWER", name="projectrole", create_type=False), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_project_member_roles_project_user", "project_member_roles", ["project_id", "user_id"], unique=True)
    op.create_index(op.f("ix_project_member_roles_id"), "project_member_roles", ["id"])
    op.create_index(op.f("ix_project_member_roles_project_id"), "project_member_roles", ["project_id"])
    op.create_index(op.f("ix_project_member_roles_user_id"), "project_member_roles", ["user_id"])

    # Project Invitations
    op.create_table(
        "project_invitations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("OWNER", "ADMIN", "MEMBER", "VIEWER", name="projectrole", create_type=False), nullable=False),
        sa.Column("token", sa.String(500), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(50), nullable=True),
        sa.Column("inviter_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_project_invitations_id"), "project_invitations", ["id"])
    op.create_index(op.f("ix_project_invitations_email"), "project_invitations", ["email"])
    op.create_index(op.f("ix_project_invitations_token"), "project_invitations", ["token"], unique=True)
    op.create_index(op.f("ix_project_invitations_project_id"), "project_invitations", ["project_id"])

    # Notifications
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(100), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.String(1000), nullable=True),
        sa.Column("link", sa.String(500), nullable=True),
        sa.Column("is_read", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("metadata_json", sa.String(2000), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_notifications_id"), "notifications", ["id"])
    op.create_index(op.f("ix_notifications_user_id"), "notifications", ["user_id"])
    op.create_index("ix_notifications_user_read", "notifications", ["user_id", "is_read"])

    # Activity Logs
    op.create_table(
        "activity_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=True),
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("metadata_json", sa.String(2000), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_activity_logs_id"), "activity_logs", ["id"])
    op.create_index(op.f("ix_activity_logs_user_id"), "activity_logs", ["user_id"])
    op.create_index(op.f("ix_activity_logs_project_id"), "activity_logs", ["project_id"])
    op.create_index(op.f("ix_activity_logs_created_at"), "activity_logs", ["created_at"])

    # Attachments
    op.create_table(
        "attachments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("filename", sa.String(500), nullable=False),
        sa.Column("original_filename", sa.String(500), nullable=False),
        sa.Column("content_type", sa.String(200), nullable=False),
        sa.Column("file_size", sa.BigInteger(), nullable=True, server_default="0"),
        sa.Column("storage_path", sa.String(1000), nullable=False),
        sa.Column("bucket", sa.String(100), nullable=True, server_default="attachments"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_attachments_id"), "attachments", ["id"])
    op.create_index(op.f("ix_attachments_task_id"), "attachments", ["task_id"])

    # User Profiles
    op.create_table(
        "user_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("timezone", sa.String(100), nullable=True, server_default="UTC"),
        sa.Column("avatar_storage_path", sa.String(1000), nullable=True),
        sa.Column("notification_preferences", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_profiles_id"), "user_profiles", ["id"])
    op.create_index(op.f("ix_user_profiles_user_id"), "user_profiles", ["user_id"], unique=True)

    # Add index to users email for faster lookups
    op.create_index("ix_users_email_lower", "users", [sa.text("lower(email)")])

    # Add index to tasks for common queries
    op.create_index("ix_tasks_project_status", "tasks", ["project_id", "status"])
    op.create_index("ix_tasks_assignee_status", "tasks", ["assignee_id", "status"])

    # Add index to comments for task lookups
    op.create_index("ix_comments_task_id", "comments", ["task_id"])


def downgrade() -> None:
    # Remove indexes
    op.drop_index("ix_comments_task_id", table_name="comments")
    op.drop_index("ix_tasks_assignee_status", table_name="tasks")
    op.drop_index("ix_tasks_project_status", table_name="tasks")
    op.drop_index("ix_users_email_lower", table_name="users")

    # Drop tables
    op.drop_table("user_profiles")
    op.drop_table("attachments")
    op.drop_table("activity_logs")
    op.drop_table("notifications")
    op.drop_table("project_invitations")
    op.drop_table("project_member_roles")

    # Drop enum type (PostgreSQL specific)
    op.execute("DROP TYPE IF EXISTS projectrole")
