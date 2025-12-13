from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from .user import User

class Conversation(SQLModel, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    state: Optional[str] = None # JSON dump of current graph state (simple view)
    
    user: Optional[User] = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation")

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: str = Field(foreign_key="conversation.id")
    role: str # user, assistant, system, tool
    content: str
    tool_calls: Optional[str] = None # JSON
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    conversation: Optional[Conversation] = Relationship(back_populates="messages")
