from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from database.connection import get_db
from models.user import User
from models.project import Project
from services.auth_service import get_current_user
from services.rbac_service import rbac_service
from services.event_service import event_manager
from config import settings

router = APIRouter(prefix="/api/events", tags=["Real-time Events"])


def _get_current_user_sse(
    token: str = Query("", alias="token"),
    db: Session = Depends(get_db),
) -> User:
    """
    Alternative auth for SSE connections.

    The standard EventSource API cannot set custom headers, so we accept
    the JWT token as a query parameter instead of an Authorization header.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing token",
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        user_id = int(sub)
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


@router.get("/project/{project_id}")
async def subscribe_project_events(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user_sse),
):
    """
    SSE endpoint: subscribe to real-time events for a project.

    The client connects via EventSource('/api/events/project/{id}?token=...')
    and receives events as SSE data frames. Uses query-param auth because
    the EventSource browser API does not support custom headers.
    """
    # Verify project exists and user has access
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "project:view")

    # Create a subscriber queue and return the streaming response
    queue = event_manager.subscribe(project_id)

    async def generate():
        async for msg in event_manager.event_stream(project_id, queue):
            yield msg

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
