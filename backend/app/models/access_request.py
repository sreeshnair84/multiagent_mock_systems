from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class AccessRequest(SQLModel, table=True):
    """Model for SAP-like access request workflows"""
    id: Optional[int] = Field(default=None, primary_key=True)
    request_id: str = Field(unique=True, index=True)  # e.g., REQ-2024-001
    user_email: str = Field(index=True)
    resource: str  # e.g., SAP Module A
    action: str  # Read, Write, Admin
    status: str = "Pending"  # Pending, Approved, Rejected
    approver_email: Optional[str] = None
    submitted_date: datetime = Field(default_factory=datetime.utcnow)
    reviewed_date: Optional[datetime] = None
    reason: Optional[str] = None  # Rejection reason or notes
