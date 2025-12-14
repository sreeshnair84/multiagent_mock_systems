from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class Email(SQLModel, table=True):
    """Model for Outlook email integration"""
    id: Optional[int] = Field(default=None, primary_key=True)
    email_id: str = Field(unique=True, index=True)  # e.g., E001
    sender: str
    recipient: str = Field(index=True)
    cc_recipients: Optional[str] = None  # Comma-separated CC emails
    bcc_recipients: Optional[str] = None  # Comma-separated BCC emails
    subject: str
    body_snippet: str  # First 200 chars of body
    importance: str = "Normal"  # Low, Normal, High
    status: str = "Unread"  # Read, Unread, Pending
    date_received: datetime = Field(default_factory=datetime.utcnow)
    has_attachment: bool = False
