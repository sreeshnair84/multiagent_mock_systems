from typing import Optional, List, Dict
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import json

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: str = Field(unique=True, index=True)
    password_hash: str = ""  # Hashed password for authentication
    role: str = "user"  # admin, supervisor, user, approver
    status: str = "Active"  # Active, Inactive, Pending
    persona: str = "default"
    token_expires: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    conversations: List["Conversation"] = Relationship(back_populates="user")

class Role(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str  # Admin, Approver, User, Pending
    permissions: str  # JSON string of permissions

class Token(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    token: str = Field(unique=True, index=True)
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
