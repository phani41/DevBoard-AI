from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database.connection import get_db
from models.user import User
from models.project import Project
from models.task import Task
from models.comment import Comment
from schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskReorder
from schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


def _check_project_access(project: Project, user: User):
    if project.owner_id != user.id and user not in project.members:
        raise HTTPException(status_code=403, detail="Access denied")


def _serialize_task(task: Task, db: Session) -> TaskResponse:
    comment_count = db.query(Comment).filter(Comment.task_id == task.id).count()
    assignee = None
    if task.assignee_rel:
        from schemas.task import UserBrief
        assignee = UserBrief(
            id=task.assignee_rel.id,
            username=task.assignee_rel.username,
            email=task.assignee_rel.email,
            avatar_url=task.assignee_rel.avatar_url,
        )

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        assignee_id=task.assignee_id,
        assignee=assignee,
        project_id=task.project_id,
        labels=task.labels or [],
        checklist=task.checklist or [],
        position=task.position or 0,
        comment_count=comment_count,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.get("", response_model=List[TaskResponse])
def list_tasks(
    project_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assignee_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task).join(Project)

    if project_id:
        query = query.filter(Task.project_id == project_id)
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            _check_project_access(project, current_user)

    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)

    tasks = query.order_by(Task.position, Task.created_at.desc()).all()
    return [_serialize_task(t, db) for t in tasks]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == task_data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    _check_project_access(project, current_user)

    max_position = db.query(Task).filter(
        Task.project_id == task_data.project_id,
        Task.status == task_data.status,
    ).count()

    task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        status=task_data.status,
        due_date=task_data.due_date,
        assignee_id=task_data.assignee_id,
        project_id=task_data.project_id,
        labels=task_data.labels or [],
        checklist=[c.model_dump() for c in (task_data.checklist or [])],
        position=max_position,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return _serialize_task(task, db)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = db.query(Project).filter(Project.id == task.project_id).first()
    _check_project_access(project, current_user)

    return _serialize_task(task, db)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = db.query(Project).filter(Project.id == task.project_id).first()
    _check_project_access(project, current_user)

    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "checklist" and value is not None:
            value = [c if isinstance(c, dict) else c.model_dump() for c in value]
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return _serialize_task(task, db)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = db.query(Project).filter(Project.id == task.project_id).first()
    _check_project_access(project, current_user)

    db.delete(task)
    db.commit()
    return None


@router.put("/{task_id}/reorder", response_model=TaskResponse)
def reorder_task(
    task_id: int,
    reorder_data: TaskReorder,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = db.query(Project).filter(Project.id == task.project_id).first()
    _check_project_access(project, current_user)

    old_status = task.status
    new_status = reorder_data.status

    task.position = reorder_data.position
    task.status = new_status

    db.commit()
    db.refresh(task)
    return _serialize_task(task, db)


# Comments
@router.get("/{task_id}/comments", response_model=List[CommentResponse])
def list_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = db.query(Project).filter(Project.id == task.project_id).first()
    _check_project_access(project, current_user)

    comments = db.query(Comment).filter(Comment.task_id == task_id).order_by(Comment.created_at).all()
    result = []
    for c in comments:
        result.append(CommentResponse(
            id=c.id,
            content=c.content,
            author_id=c.author_id,
            author_name=c.author.username if c.author else None,
            author_avatar=c.author.avatar_url if c.author else None,
            task_id=c.task_id,
            created_at=c.created_at,
            updated_at=c.updated_at,
        ))
    return result


@router.post("/{task_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    task_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = db.query(Project).filter(Project.id == task.project_id).first()
    _check_project_access(project, current_user)

    comment = Comment(
        content=comment_data.content,
        author_id=current_user.id,
        task_id=task_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CommentResponse(
        id=comment.id,
        content=comment.content,
        author_id=comment.author_id,
        author_name=current_user.username,
        author_avatar=current_user.avatar_url,
        task_id=comment.task_id,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )
