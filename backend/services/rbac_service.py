from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from models.user import User
from models.project import Project
from models.rbac import ProjectMemberRole, ProjectRole
from database.connection import get_db
from services.auth_service import get_current_user


class RBACService:
    """Role-Based Access Control service for project-level permissions."""

    ROLE_HIERARCHY = {
        ProjectRole.VIEWER: 0,
        ProjectRole.MEMBER: 1,
        ProjectRole.ADMIN: 2,
        ProjectRole.OWNER: 3,
    }

    PERMISSIONS = {
        "project:view": [ProjectRole.VIEWER, ProjectRole.MEMBER, ProjectRole.ADMIN, ProjectRole.OWNER],
        "project:edit": [ProjectRole.ADMIN, ProjectRole.OWNER],
        "project:delete": [ProjectRole.OWNER],
        "project:manage_roles": [ProjectRole.OWNER],
        "project:transfer_ownership": [ProjectRole.OWNER],
        "task:create": [ProjectRole.MEMBER, ProjectRole.ADMIN, ProjectRole.OWNER],
        "task:edit_any": [ProjectRole.ADMIN, ProjectRole.OWNER],
        "task:edit_own": [ProjectRole.MEMBER, ProjectRole.ADMIN, ProjectRole.OWNER],
        "task:delete_any": [ProjectRole.ADMIN, ProjectRole.OWNER],
        "task:delete_own": [ProjectRole.MEMBER, ProjectRole.ADMIN, ProjectRole.OWNER],
        "task:reorder": [ProjectRole.MEMBER, ProjectRole.ADMIN, ProjectRole.OWNER],
        "member:invite": [ProjectRole.ADMIN, ProjectRole.OWNER],
        "member:remove": [ProjectRole.ADMIN, ProjectRole.OWNER],
        "member:view": [ProjectRole.VIEWER, ProjectRole.MEMBER, ProjectRole.ADMIN, ProjectRole.OWNER],
        "comment:create": [ProjectRole.MEMBER, ProjectRole.ADMIN, ProjectRole.OWNER],
        "comment:delete_any": [ProjectRole.ADMIN, ProjectRole.OWNER],
        "comment:delete_own": [ProjectRole.MEMBER, ProjectRole.ADMIN, ProjectRole.OWNER],
        "ai:use": [ProjectRole.MEMBER, ProjectRole.ADMIN, ProjectRole.OWNER],
    }

    @staticmethod
    def get_user_role(db: Session, project_id: int, user_id: int) -> Optional[ProjectRole]:
        """Get the role of a user in a project."""
        if not project_id or not user_id:
            return None

        # Check if user is the owner
        project = db.query(Project).filter(Project.id == project_id).first()
        if project and project.owner_id == user_id:
            return ProjectRole.OWNER

        # Check role assignments
        role_assignment = db.query(ProjectMemberRole).filter(
            ProjectMemberRole.project_id == project_id,
            ProjectMemberRole.user_id == user_id,
        ).first()

        if role_assignment:
            return role_assignment.role

        return None

    @staticmethod
    def has_permission(role: Optional[ProjectRole], permission: str) -> bool:
        """Check if a role has a specific permission."""
        if role is None:
            return False

        allowed_roles = RBACService.PERMISSIONS.get(permission, [])
        role_rank = RBACService.ROLE_HIERARCHY.get(role, -1)

        for allowed in allowed_roles:
            if RBACService.ROLE_HIERARCHY.get(allowed, -1) <= role_rank:
                return True

        return False

    @staticmethod
    def ensure_project_access(project: Project, user: User, db: Session, permission: str = "project:view"):
        """Ensure a user has the required permission for a project."""
        if project.owner_id == user.id:
            return True

        role = RBACService.get_user_role(db, project.id, user.id)
        if not role or not RBACService.has_permission(role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return True

    @staticmethod
    def get_role_badge_variant(role: ProjectRole) -> str:
        """Get the badge variant for a role."""
        variants = {
            ProjectRole.OWNER: "default",
            ProjectRole.ADMIN: "info",
            ProjectRole.MEMBER: "secondary",
            ProjectRole.VIEWER: "outline",
        }
        return variants.get(role, "secondary")

    @staticmethod
    def set_user_role(db: Session, project_id: int, user_id: int, role: ProjectRole, actor_user_id: int) -> ProjectMemberRole:
        """Set or update a user's role in a project."""
        # Validate actor has permission
        actor_role = RBACService.get_user_role(db, project_id, actor_user_id)
        if not RBACService.has_permission(actor_role, "project:manage_roles"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the project owner can manage roles",
            )

        # Can't change owner's role
        project = db.query(Project).filter(Project.id == project_id).first()
        if project and project.owner_id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change the project owner's role",
            )

        # Can't assign owner role through this method
        if role == ProjectRole.OWNER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Use transfer ownership to change the owner",
            )

        existing = db.query(ProjectMemberRole).filter(
            ProjectMemberRole.project_id == project_id,
            ProjectMemberRole.user_id == user_id,
        ).first()

        if existing:
            existing.role = role
            db.commit()
            db.refresh(existing)
            return existing
        else:
            new_role = ProjectMemberRole(
                project_id=project_id,
                user_id=user_id,
                role=role,
            )
            db.add(new_role)
            db.commit()
            db.refresh(new_role)
            return new_role

    @staticmethod
    def transfer_ownership(db: Session, project_id: int, new_owner_id: int, current_user_id: int) -> Project:
        """Transfer project ownership to another user."""
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        if project.owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the owner can transfer ownership",
            )

        # Update the old owner's role to admin
        old_role = db.query(ProjectMemberRole).filter(
            ProjectMemberRole.project_id == project_id,
            ProjectMemberRole.user_id == current_user_id,
        ).first()

        if old_role:
            old_role.role = ProjectRole.ADMIN
        else:
            new_admin = ProjectMemberRole(
                project_id=project_id,
                user_id=current_user_id,
                role=ProjectRole.ADMIN,
            )
            db.add(new_admin)

        # Update the new owner's role to owner
        new_role = db.query(ProjectMemberRole).filter(
            ProjectMemberRole.project_id == project_id,
            ProjectMemberRole.user_id == new_owner_id,
        ).first()

        if new_role:
            new_role.role = ProjectRole.OWNER

        # Update project owner
        project.owner_id = new_owner_id
        db.commit()
        db.refresh(project)
        return project


rbac_service = RBACService()
