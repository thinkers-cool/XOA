from pydantic import BaseModel, Field
from typing import List, Optional

class RoleBase(BaseModel):
    name: str = Field(..., description="Name of the role", min_length=1)
    description: Optional[str] = Field(None, description="Description of the role")
    permissions: List[str] = Field(default_factory=list, description="List of permissions associated with the role")

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    name: Optional[str] = Field(None, description="Name of the role", min_length=1)

class Role(RoleBase):
    id: int

    class Config:
        from_attributes = True

class UserRoleBase(BaseModel):
    role_id: int = Field(..., description="ID of the role")
    reports_to_id: Optional[int] = Field(None, description="ID of the supervisor user for this role")

class UserRoleCreate(UserRoleBase):
    user_id: Optional[int] = Field(None, description="ID of the user")

class UserRole(UserRoleBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True