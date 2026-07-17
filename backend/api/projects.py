from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from database.connection import get_db
from models.user import User
from models.project import Project, project_members
from models.task import Task
from models.rbac import ProjectMemberRole, ProjectRole
from schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectMemberAdd, ProjectListResponse
from schemas.rbac import ProjectMemberWithRole
from services.auth_service import get_current_user
from services.rbac_service import rbac_service
from services.activity_service import activity_service

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
def list_projects(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Project)
        .filter(
            (Project.owner_id == current_user.id)
            | (Project.members.any(id=current_user.id))
        )
    )

    if status_filter:
        query = query.filter(Project.status == status_filter)

    total = query.count()
    projects = query.order_by(Project.updated_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    result = []
    for project in projects:
        task_count = db.query(Task).filter(Task.project_id == project.id).count()
        project_data = ProjectResponse.model_validate(project)
        project_data.task_count = task_count
        result.append(project_data)

    if page == 1 and per_page >= total:
        return result

    return result


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        name=project_data.name,
        description=project_data.description,
        status=project_data.status or "active",
        deadline=project_data.deadline,
        owner_id=current_user.id,
    )
    project.members.append(current_user)
    db.add(project)
    db.commit()
    db.refresh(project)

    # Create owner role assignment
    owner_role = ProjectMemberRole(
        project_id=project.id,
        user_id=current_user.id,
        role=ProjectRole.OWNER,
    )
    db.add(owner_role)
    db.commit()

    activity_service.log(
        db=db,
        action="project_created",
        user_id=current_user.id,
        project_id=project.id,
        description=f"Created project '{project.name}'",
    )

    project_data = ProjectResponse.model_validate(project)
    project_data.task_count = 0
    return project_data


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "project:view")

    task_count = db.query(Task).filter(Task.project_id == project.id).count()
    project_data = ProjectResponse.model_validate(project)
    project_data.task_count = task_count
    return project_data


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "project:edit")

    if project_data.model_dump(exclude_unset=True):
        activity_service.log(
            db=db,
            action="project_updated",
            user_id=current_user.id,
            project_id=project_id,
            description=f"Updated project '{project.name}'",
        )

    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    task_count = db.query(Task).filter(Task.project_id == project.id).count()
    project_data = ProjectResponse.model_validate(project)
    project_data.task_count = task_count
    return project_data


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "project:delete")

    activity_service.log(
        db=db,
        action="project_deleted",
        user_id=current_user.id,
        description=f"Deleted project '{project.name}'",
    )

    db.delete(project)
    db.commit()
    return None


@router.post("/{project_id}/members", response_model=ProjectResponse)
def add_member(
    project_id: int,
    member_data: ProjectMemberAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "member:invite")

    user = db.query(User).filter(User.id == member_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user in project.members:
        raise HTTPException(status_code=400, detail="User is already a member")

    project.members.append(user)

    # Assign default member role
    role = ProjectMemberRole(
        project_id=project_id,
        user_id=user.id,
        role=ProjectRole.MEMBER,
    )
    db.add(role)
    db.commit()

    activity_service.log(
        db=db,
        action="member_joined",
        user_id=current_user.id,
        project_id=project_id,
        description=f"Added {user.username} to the project",
    )

    db.refresh(project)
    task_count = db.query(Task).filter(Task.project_id == project.id).count()
    project_data = ProjectResponse.model_validate(project)
    project_data.task_count = task_count
    return project_data


@router.delete("/{project_id}/members/{user_id}", response_model=ProjectResponse)
def remove_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "member:remove")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or user not in project.members:
        raise HTTPException(status_code=404, detail="Member not found")

    if user.id == project.owner_id:
        raise HTTPException(status_code=400, detail="Cannot remove the project owner")

    project.members.remove(user)

    # Remove role assignment
    db.query(ProjectMemberRole).filter(
        ProjectMemberRole.project_id == project_id,
        ProjectMemberRole.user_id == user_id,
    ).delete()

    db.commit()

    activity_service.log(
        db=db,
        action="member_removed",
        user_id=current_user.id,
        project_id=project_id,
        description=f"Removed {user.username} from the project",
    )

    db.refresh(project)
    task_count = db.query(Task).filter(Task.project_id == project.id).count()
    project_data = ProjectResponse.model_validate(project)
    project_data.task_count = task_count
    return project_data


@router.get("/{project_id}/members", response_model=List[ProjectMemberWithRole])
def list_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List project members with their roles."""
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
