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
    risk_level: str = "Low"  # Low, Medium, High, Critical - automated risk assessment
    business_justification: Optional[str] = None  # Required justification for access
    approver_email: Optional[str] = None
    submitted_date: datetime = Field(default_factory=datetime.utcnow)
    reviewed_date: Optional[datetime] = None
    validity_start_date: Optional[datetime] = None  # Access start date
    validity_end_date: Optional[datetime] = None  # Access expiration date
    reason: Optional[str] = None  # Rejection reason or notes
