from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.user import User
from models.project import Project
from models.rbac import ProjectMemberRole, ProjectRole
from schemas.rbac import ProjectRoleResponse, ProjectRoleUpdate, ProjectMemberWithRole
from services.auth_service import get_current_user
from services.rbac_service import rbac_service
from services.activity_service import activity_service

router = APIRouter(prefix="/api/projects/{project_id}/roles", tags=["RBAC"])


@router.get("/members", response_model=List[ProjectMemberWithRole])
def get_project_members_with_roles(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all project members with their roles."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "member:view")

    members = []
    for member in project.members:
        role = rbac_service.get_user_role(db, project_id, member.id)
        members.append(ProjectMemberWithRole(
            id=member.id,
            email=member.email,
            username=member.username,
            full_name=member.full_name,
            avatar_url=member.avatar_url,
            role=role or (ProjectRole.OWNER if project.owner_id == member.id else ProjectRole.VIEWER),
        ))

    return members


@router.put("/members", response_model=List[ProjectMemberWithRole])
def update_member_roles(
    project_id: int,
    role_updates: List[ProjectRoleUpdate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update roles for project members."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "project:manage_roles")

    results = []
    for update in role_updates:
        member = db.query(User).filter(User.id == update.user_id).first()
        if not member:
            continue

        role_assignment = rbac_service.set_user_role(
            db, project_id, update.user_id, update.role, current_user.id
        )
        results.append(ProjectMemberWithRole(
            id=member.id,
            email=member.email,
            username=member.username,
            full_name=member.full_name,
            avatar_url=member.avatar_url,
            role=role_assignment.role,
        ))

        activity_service.log(
            db=db,
            action="role_changed",
            user_id=current_user.id,
            project_id=project_id,
            description=f"Changed {member.username}'s role to {update.role.value}",
        )

    return results


@router.post("/transfer-ownership/{new_owner_id}", status_code=status.HTTP_200_OK)
def transfer_ownership(
    project_id: int,
    new_owner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Transfer project ownership to another user."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Verify new owner is a member
    new_owner = db.query(User).filter(User.id == new_owner_id).first()
    if not new_owner or new_owner not in project.members:
        raise HTTPException(status_code=400, detail="New owner must be a project member")

    rbac_service.transfer_ownership(db, project_id, new_owner_id, current_user.id)

    activity_service.log(
        db=db,
        action="ownership_transferred",
        user_id=current_user.id,
        project_id=project_id,
        description=f"Transferred ownership to {new_owner.username}",
    )

    return {"message": f"Ownership transferred to {new_owner.username}"}
