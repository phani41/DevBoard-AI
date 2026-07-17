from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AttachmentResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    filename: str
    original_filename: str
    content_type: str
    file_size: int
    storage_path: str
    bucket: str
    created_at: datetime
    uploader_name: Optional[str] = None

    class Config:
        from_attributes = True


class AttachmentUploadResponse(BaseModel):
    id: int
    filename: str
    url: Optional[str] = None
    message: str = "File uploaded successfully"
