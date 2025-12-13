from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class Device(SQLModel, table=True):
    """Model for Intune device management"""
    id: Optional[int] = Field(default=None, primary_key=True)
    device_id: str = Field(unique=True, index=True)  # e.g., D001
    serial_number: str = Field(unique=True, index=True)
    user_email: str = Field(index=True)
    profile_name: str  # Standard, Mobile, etc.
    status: str = "Pending"  # Enrolled, Pending, Failed
    provision_date: Optional[datetime] = None
    os_version: str
    last_sync: Optional[datetime] = None
    created_date: datetime = Field(default_factory=datetime.utcnow)
