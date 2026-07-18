from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database.connection import get_db
from models.user import User
from models.project import Project
from models.task import Task
from models.comment import Comment
from schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskReorder
from schemas.comment import CommentCreate, CommentResponse
from services.auth_service import get_current_user
from services.rbac_service import rbac_service
from services.activity_service import activity_service
from services.notification_service import notification_service
from services.event_service import event_manager, ProjectEvent
import asyncio

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


def _check_project_access(project: Project, user: User, db: Session, permission: str = "project:view"):
    rbac_service.ensure_project_access(project, user, db, permission)


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
    page: int = Query(1, ge=1),
    per_page: int = Query(100, ge=1, le=200),
    sort_by: str = Query("position", regex="^(position|created_at|due_date|priority|title)$"),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get user's accessible project IDs (security: scope by membership)
    user_project_ids = [
        p.id for p in db.query(Project).filter(
            (Project.owner_id == current_user.id) |
            (Project.members.any(id=current_user.id))
        ).all()
    ]

    query = db.query(Task).join(Project)

    if project_id:
        # Scoped to specific project (must be accessible)
        if project_id not in user_project_ids:
            return []
        query = query.filter(Task.project_id == project_id)
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            _check_project_access(project, current_user, db)
    else:
        # No project_id provided — scope by all user's accessible projects
        query = query.filter(Project.id.in_(user_project_ids))

    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)

    # Sorting
    sort_column = getattr(Task, sort_by, Task.position)
    if sort_order == "desc":
        sort_column = sort_column.desc()
    else:
        sort_column = sort_column.asc()

    tasks = query.order_by(sort_column, Task.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
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
    _check_project_access(project, current_user, db, "task:create")

    max_position = db.query(Task).filter(
        Task.project_id == task_data.project_id,
        Task.status == task_data.status or "todo",
    ).count()

    task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority or "medium",
        status=task_data.status or "todo",
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

    activity_service.log(
        db=db,
        action="task_created",
        user_id=current_user.id,
        project_id=project.id,
        task_id=task.id,
        description=f"Created task '{task.title}'",
    )

    # Notify assignee if set
    if task.assignee_id and task.assignee_id != current_user.id:
        notification_service.create(
            db=db,
            user_id=task.assignee_id,
            type="task_assigned",
            title=f"New task assigned: {task.title}",
            message=f"You have been assigned a new task in {project.name}",
            link=f"/tasks/{task.id}",
        )

    # Broadcast real-time event
    asyncio.create_task(
        event_manager.publish(ProjectEvent(
            event="task_created",
            project_id=project.id,
            data={"task_id": task.id, "title": task.title, "status": task.status},
            user_id=current_user.id,
        ))
    )

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
    if project:
        _check_project_access(project, current_user, db)

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
    if project:
        # Check if user can edit any task or just their own
        permission = "task:edit_any"
        if task.assignee_id and task.assignee_id != current_user.id:
            permission = "task:edit_any"
        elif not task.assignee_id or task.assignee_id == current_user.id:
            permission = "task:edit_own"
        _check_project_access(project, current_user, db, permission)

    update_data = task_data.model_dump(exclude_unset=True)

    # Track status changes for notification
    old_status = task.status
    new_assignee = update_data.get("assignee_id")

    for field, value in update_data.items():
        if field == "checklist" and value is not None:
            value = [c if isinstance(c, dict) else c.model_dump() for c in value]
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    activity_service.log(
        db=db,
        action="task_updated",
        user_id=current_user.id,
        project_id=project.id if project else None,
        task_id=task.id,
        description=f"Updated task '{task.title}'",
        metadata_json={"updated_fields": list(update_data.keys())},
    )

    # Notify new assignee
    if new_assignee and new_assignee != current_user.id and new_assignee != task.assignee_id:
        notification_service.create(
            db=db,
            user_id=new_assignee,
            type="task_assigned",
            title=f"Task assigned: {task.title}",
            message=f"You have been assigned to a task in {project.name if project else 'a project'}",
            link=f"/tasks/{task.id}",
        )

    # Broadcast real-time event
    asyncio.create_task(
        event_manager.publish(ProjectEvent(
            event="task_updated",
            project_id=task.project_id,
            data={"task_id": task.id, "title": task.title, "status": task.status, "updated_fields": list(update_data.keys())},
            user_id=current_user.id,
        ))
    )

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
    if project:
        permission = "task:delete_own" if task.assignee_id == current_user.id else "task:delete_any"
        _check_project_access(project, current_user, db, permission)

    task_project_id = task.project_id
    task_title = task.title

    activity_service.log(
        db=db,
        action="task_deleted",
        user_id=current_user.id,
        project_id=project.id if project else None,
        description=f"Deleted task '{task.title}'",
    )

    db.delete(task)
    db.commit()

    # Broadcast real-time event
    asyncio.create_task(
        event_manager.publish(ProjectEvent(
            event="task_deleted",
            project_id=task_project_id,
            data={"task_id": task_id, "title": task_title},
            user_id=current_user.id,
        ))
    )

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
    if project:
        _check_project_access(project, current_user, db, "task:reorder")

    task.position = reorder_data.position
    task.status = reorder_data.status

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
    if project:
        _check_project_access(project, current_user, db)

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
    if project:
        _check_project_access(project, current_user, db, "comment:create")

    comment = Comment(
        content=comment_data.content,
        author_id=current_user.id,
        task_id=task_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    activity_service.log(
        db=db,
        action="comment_added",
        user_id=current_user.id,
        project_id=project.id if project else None,
        task_id=task_id,
        description=f"Added a comment to '{task.title}'",
    )

    # Notify task assignee if not the commenter
    if task.assignee_id and task.assignee_id != current_user.id:
        notification_service.create(
            db=db,
            user_id=task.assignee_id,
            type="comment_added",
            title=f"New comment on: {task.title}",
            message=f"{current_user.username} commented on your task",
            link=f"/tasks/{task.id}",
        )

    # Broadcast real-time event
    asyncio.create_task(
        event_manager.publish(ProjectEvent(
            event="comment_added",
            project_id=project.id if project else None,
            data={"task_id": task_id, "comment_id": comment.id, "author": current_user.username},
            user_id=current_user.id,
        ))
    )

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
