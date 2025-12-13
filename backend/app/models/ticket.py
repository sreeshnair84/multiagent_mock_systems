from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class Ticket(SQLModel, table=True):
    """Model for ServiceNow ticket management"""
    id: Optional[int] = Field(default=None, primary_key=True)
    ticket_id: str = Field(unique=True, index=True)  # e.g., T001, INC0019283
    title: str
    description: str
    status: str = "Open"  # Open, In Progress, Closed, Resolved, Cancelled
    priority: str = "Medium"  # Low, Medium, High, Critical
    impact: str = "Medium"  # Low, Medium, High
    category: Optional[str] = None  # e.g., Hardware, Software, Network
    subcategory: Optional[str] = None  # e.g., Laptop, Email, WiFi
    assignee_email: Optional[str] = None
    requester_email: Optional[str] = None
    work_notes: str = "[]"  # JSON array of work note entries
    tags: Optional[str] = None  # Comma-separated tags
    closing_notes: Optional[str] = None  # Notes added when closing ticket
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)
    resolved_date: Optional[datetime] = None
    closed_date: Optional[datetime] = None
