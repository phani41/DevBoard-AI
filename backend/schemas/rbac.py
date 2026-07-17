from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.rbac import ProjectRole


class ProjectRoleResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    role: ProjectRole
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


class ProjectRoleUpdate(BaseModel):
    user_id: int
    role: ProjectRole


class ProjectRoleBatchUpdate(BaseModel):
    members: List[ProjectRoleUpdate]


class ProjectMemberWithRole(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[ProjectRole] = None

    class Config:
        from_attributes = True
        use_enum_values = True
