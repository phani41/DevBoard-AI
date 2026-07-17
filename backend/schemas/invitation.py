from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models.rbac import ProjectRole


class InvitationCreate(BaseModel):
    email: str
    role: ProjectRole = ProjectRole.MEMBER


class InvitationCreateBatch(BaseModel):
    invitations: List[InvitationCreate]


class InvitationResponse(BaseModel):
    id: int
    project_id: int
    email: str
    role: ProjectRole
    token: str
    expires_at: datetime
    status: str
    inviter_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


class InvitationAccept(BaseModel):
    token: str


class InvitationPublicResponse(BaseModel):
    id: int
    project_id: int
    project_name: Optional[str] = None
    email: str
    role: ProjectRole
    inviter_name: Optional[str] = None
    expires_at: datetime
    status: str

    class Config:
        from_attributes = True
        use_enum_values = True
