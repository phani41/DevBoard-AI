from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import mimetypes
import os
import uuid
from datetime import datetime
from database.connection import get_db
from models.user import User
from models.task import Task
from models.project import Project
from models.attachment import Attachment
from schemas.attachment import AttachmentResponse, AttachmentUploadResponse
from services.auth_service import get_current_user
from services.rbac_service import rbac_service
from services.activity_service import activity_service
from config import settings

router = APIRouter(prefix="/api/attachments", tags=["Attachments"])

# Allowed file types and size limit
ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    "application/pdf",
    "application/zip", "application/x-zip-compressed",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain", "text/csv", "application/json",
    "application/msword",
    "application/vnd.ms-excel",
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# Storage type: "local" or "supabase"
STORAGE_TYPE = os.getenv("STORAGE_TYPE", "local")
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")


def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    _, ext = os.path.splitext(filename)
    return ext.lower()


def validate_file(content_type: str, file_size: int, filename: str):
    """Validate file type and size."""
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum of {MAX_FILE_SIZE // (1024*1024)}MB",
        )

    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{content_type}' is not allowed. Allowed types: images, PDF, ZIP, Word, Excel",
        )


def save_file_local(file: UploadFile, task_id: int) -> tuple[str, str, str]:
    """Save file to local storage."""
    # Create upload directory for task
    task_dir = os.path.join(UPLOAD_DIR, str(task_id))
    os.makedirs(task_dir, exist_ok=True)

    # Generate unique filename
    ext = get_file_extension(file.filename or "file")
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(task_dir, unique_name)

    # Save file
    content = file.file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    return unique_name, file_path, f"/uploads/{task_id}/{unique_name}"


def upload_to_supabase(file: UploadFile, task_id: int) -> tuple[str, str, str]:
    """Upload file to Supabase Storage."""
    supabase_url = os.getenv("SUPABASE_URL", "")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY", "")
    bucket = os.getenv("SUPABASE_STORAGE_BUCKET", "attachments")

    if not supabase_url or not supabase_key:
        # Fallback to local storage
        return save_file_local(file, task_id)

    try:
        import httpx
        ext = get_file_extension(file.filename or "file")
        unique_name = f"{task_id}/{uuid.uuid4().hex}{ext}"

        # Upload to Supabase Storage REST API
        content = file.file.read()
        upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{unique_name}"

        with httpx.Client() as client:
            response = client.post(
                upload_url,
                headers={
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": file.content_type or "application/octet-stream",
                },
                content=content,
                timeout=120.0,
            )
            if response.status_code not in (200, 201):
                raise HTTPException(
                    status_code=500,
                    detail="Failed to upload file to storage",
                )

        public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{unique_name}"
        return unique_name, unique_name, public_url
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Storage upload failed: {str(e)}",
        )


@router.post("/upload/{task_id}", response_model=AttachmentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a file attachment to a task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = db.query(Project).filter(Project.id == task.project_id).first()
    if project:
        rbac_service.ensure_project_access(project, current_user, db, "task:edit_own")

    # Validate file
    content_type = file.content_type or mimetypes.guess_type(file.filename or "file")[0] or "application/octet-stream"
    file.file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.file.seek(0)  # Seek back to beginning

    validate_file(content_type, file_size, file.filename or "file")

    # Save file
    if STORAGE_TYPE == "supabase":
        unique_name, storage_path, url = upload_to_supabase(file, task_id)
    else:
        unique_name, storage_path, url = save_file_local(file, task_id)

    bucket = "attachments"
    if STORAGE_TYPE == "supabase":
        bucket = os.getenv("SUPABASE_STORAGE_BUCKET", "attachments")

    # Create attachment record
    attachment = Attachment(
        task_id=task_id,
        user_id=current_user.id,
        filename=unique_name,
        original_filename=file.filename or "file",
        content_type=content_type,
        file_size=file_size,
        storage_path=storage_path,
        bucket=bucket,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    activity_service.log(
        db=db,
        action="attachment_uploaded",
        user_id=current_user.id,
        project_id=task.project_id if project else None,
        task_id=task_id,
        description=f"Uploaded {file.filename}",
    )

    return AttachmentUploadResponse(
        id=attachment.id,
        filename=file.filename or "file",
        url=url if STORAGE_TYPE == "supabase" else None,
    )


@router.get("/task/{task_id}", response_model=List[AttachmentResponse])
def get_task_attachments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all attachments for a task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = db.query(Project).filter(Project.id == task.project_id).first()
    if project:
        rbac_service.ensure_project_access(project, current_user, db, "project:view")

    attachments = db.query(Attachment).filter(Attachment.task_id == task_id).order_by(Attachment.created_at.desc()).all()

    result = []
    for a in attachments:
        uploader = db.query(User).filter(User.id == a.user_id).first()
        result.append(AttachmentResponse(
            id=a.id,
            task_id=a.task_id,
            user_id=a.user_id,
            filename=a.filename,
            original_filename=a.original_filename,
            content_type=a.content_type,
            file_size=a.file_size,
            storage_path=a.storage_path,
            bucket=a.bucket,
            created_at=a.created_at,
            uploader_name=uploader.full_name or uploader.username if uploader else None,
        ))

    return result


@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an attachment."""
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    # Check permission
    task = db.query(Task).filter(Task.id == attachment.task_id).first()
    if task:
        project = db.query(Project).filter(Project.id == task.project_id).first()
        if project:
            rbac_service.ensure_project_access(project, current_user, db, "task:edit_any")

    if attachment.user_id != current_user.id:
        if project:
            rbac_service.ensure_project_access(project, current_user, db, "task:delete_any")

    # Delete file from storage
    if STORAGE_TYPE == "local" and os.path.exists(attachment.storage_path):
        try:
            os.remove(attachment.storage_path)
        except OSError:
            pass

    db.delete(attachment)
    db.commit()

    return None
