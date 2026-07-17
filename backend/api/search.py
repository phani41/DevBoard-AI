from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from database.connection import get_db
from models.user import User
from models.project import Project
from models.task import Task
from models.comment import Comment
from models.ai_history import AIHistory
from schemas.search import SearchRequest, SearchResponse, SearchResult, SearchFilter
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.get("", response_model=SearchResponse)
def global_search(
    q: str = Query("", description="Search query"),
    project_id: Optional[int] = Query(None, description="Filter by project"),
    status: Optional[str] = Query(None, description="Filter by task status"),
    priority: Optional[str] = Query(None, description="Filter by task priority"),
    assignee_id: Optional[int] = Query(None, description="Filter by assignee"),
    type: Optional[str] = Query(None, description="Filter by result type (project, task, comment, member, ai_history)"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Global search across projects, tasks, comments, members, and AI history."""
    results = []
    search_term = f"%{q}%"

    # Get user's projects
    user_project_ids = [
        p.id for p in db.query(Project).filter(
            (Project.owner_id == current_user.id) |
            (Project.members.any(id=current_user.id))
        ).all()
    ]

    if not user_project_ids:
        return SearchResponse(results=[], total=0, page=page, per_page=per_page)

    # Search Projects
    if not type or type == "project":
        project_query = db.query(Project).filter(
            Project.id.in_(user_project_ids),
            or_(
                Project.name.ilike(search_term),
                Project.description.ilike(search_term),
            ),
        )
        if project_id:
            project_query = project_query.filter(Project.id == project_id)

        for p in project_query.limit(10).all():
            results.append(SearchResult(
                id=p.id,
                type="project",
                title=p.name,
                description=p.description,
                link=f"/projects/{p.id}",
                metadata={"status": p.status},
                score=1.0,
            ))

    # Search Tasks
    if not type or type == "task":
        task_query = db.query(Task).filter(
            Task.project_id.in_(user_project_ids),
            or_(
                Task.title.ilike(search_term),
                Task.description.ilike(search_term),
            ),
        )
        if project_id:
            task_query = task_query.filter(Task.project_id == project_id)
        if status:
            task_query = task_query.filter(Task.status == status)
        if priority:
            task_query = task_query.filter(Task.priority == priority)
        if assignee_id:
            task_query = task_query.filter(Task.assignee_id == assignee_id)

        for t in task_query.limit(20).all():
            results.append(SearchResult(
                id=t.id,
                type="task",
                title=t.title,
                description=t.description,
                link=f"/tasks/{t.id}",
                metadata={
                    "status": t.status,
                    "priority": t.priority,
                    "project_id": t.project_id,
                },
                score=0.9,
            ))

    # Search Comments
    if not type or type == "comment":
        comment_query = db.query(Comment).join(Task).filter(
            Task.project_id.in_(user_project_ids),
            Comment.content.ilike(search_term),
        ).limit(10)

        for c in comment_query.all():
            results.append(SearchResult(
                id=c.id,
                type="comment",
                title=f"Comment by {c.author.username if c.author else 'Unknown'}",
                description=c.content[:200],
                link=f"/tasks/{c.task_id}",
                metadata={"task_id": c.task_id},
                score=0.7,
            ))

    # Search Members (only when query is provided to prevent email enumeration)
    if q and (not type or type == "member"):
        member_query = db.query(User).filter(
            User.email.ilike(search_term),
        ).limit(10)

        for u in member_query.all():
            results.append(SearchResult(
                id=u.id,
                type="member",
                title=u.full_name or u.username,
                description=u.email,
                link=f"/settings",
                metadata={"username": u.username},
                score=0.6,
            ))

    # Search AI History
    if not type or type == "ai_history":
        ai_query = db.query(AIHistory).filter(
            AIHistory.user_id == current_user.id,
            or_(
                AIHistory.input_text.ilike(search_term),
                AIHistory.output_text.ilike(search_term),
            ),
        ).limit(10)

        for h in ai_query.all():
            results.append(SearchResult(
                id=h.id,
                type="ai_history",
                title=f"AI {h.feature_type.replace('_', ' ').title()}",
                description=h.input_text[:200],
                link=f"/ai?history={h.id}",
                metadata={"feature_type": h.feature_type},
                score=0.5,
            ))

    # Sort by score descending
    results.sort(key=lambda r: r.score, reverse=True)

    # Paginate
    total = len(results)
    start = (page - 1) * per_page
    end = start + per_page
    paginated_results = results[start:end]

    return SearchResponse(
        results=paginated_results,
        total=total,
        page=page,
        per_page=per_page,
    )
