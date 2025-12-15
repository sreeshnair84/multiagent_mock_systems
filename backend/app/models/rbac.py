
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class UserFlavor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str  # e.g., "Developer", "Manager", "Remote Worker"
    description: Optional[str] = None
    attributes: str = "{}" # JSON string for specific flavor attributes (e.g. {"vpn_required": true})

class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True) # e.g. "Intune", "SAP", "ServiceNow"
    description: Optional[str] = None
    
    roles: List["AppRole"] = Relationship(back_populates="application")

class AppRole(SQLModel, table=True):
    """
    Granular role within a specific application.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str # e.g. "Device Admin", "SAP Approver"
    application_id: Optional[int] = Field(default=None, foreign_key="application.id")
    description: Optional[str] = None
    
    application: Optional[Application] = Relationship(back_populates="roles")
    permissions: List["AppPermission"] = Relationship(back_populates="role")
    users: List["UserAppRoleLink"] = Relationship(back_populates="role")

class AppPermission(SQLModel, table=True):
    """
    Specific permission for a role.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    role_id: int = Field(foreign_key="approle.id")
    resource: str # e.g. "device", "ticket"
    action: str # e.g. "read", "write", "approve"
    
    role: Optional[AppRole] = Relationship(back_populates="permissions")

class UserAppRoleLink(SQLModel, table=True):
    """
    Many-to-Many link between User and AppRole.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    role_id: int = Field(foreign_key="approle.id")
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    
    role: Optional[AppRole] = Relationship(back_populates="users")
