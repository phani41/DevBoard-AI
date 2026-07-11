from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.user import User
from models.project import Project, project_members
from models.task import Task
from schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectMemberAdd
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = (
        db.query(Project)
        .filter(
            (Project.owner_id == current_user.id)
            | (Project.members.any(id=current_user.id))
        )
        .all()
    )

    result = []
    for project in projects:
        task_count = db.query(Task).filter(Task.project_id == project.id).count()
        project_data = ProjectResponse.model_validate(project)
        project_data.task_count = task_count
        result.append(project_data)

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
        status=project_data.status,
        deadline=project_data.deadline,
        owner_id=current_user.id,
    )
    project.members.append(current_user)
    db.add(project)
    db.commit()
    db.refresh(project)

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

    if project.owner_id != current_user.id and current_user not in project.members:
        raise HTTPException(status_code=403, detail="Access denied")

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

    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can update this project")

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

    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can delete this project")

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

    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can add members")

    user = db.query(User).filter(User.id == member_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user in project.members:
        raise HTTPException(status_code=400, detail="User is already a member")

    project.members.append(user)
    db.commit()
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

    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can remove members")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or user not in project.members:
        raise HTTPException(status_code=404, detail="Member not found")

    if user.id == project.owner_id:
        raise HTTPException(status_code=400, detail="Cannot remove the project owner")

    project.members.remove(user)
    db.commit()
    db.refresh(project)

    task_count = db.query(Task).filter(Task.project_id == project.id).count()
    project_data = ProjectResponse.model_validate(project)
    project_data.task_count = task_count
    return project_data
