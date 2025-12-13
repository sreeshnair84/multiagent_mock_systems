"""
Outlook Agent Tools
Handles email operations and approval extraction
Exposed via MCP server, not as LangChain tools
"""
from typing import List, Dict, Any, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime

from app.models import Email
from app.core.database import engine


async def send_email(sender: str, recipient: str, subject: str, body: str) -> Dict[str, Any]:
    """Sends an email (creates email record).
    
    Args:
        sender: Sender email address
        recipient: Recipient email address
        subject: Email subject
        body: Email body content
    
    Returns:
        Dict with email details
    """
    async with AsyncSession(engine) as session:
        # Generate email ID
        result = await session.exec(select(Email))
        emails = result.all()
        email_num = len(emails) + 1
        email_id = f"E{email_num:03d}"
        
        email = Email(
            email_id=email_id,
            sender=sender,
            recipient=recipient,
            subject=subject,
            body_snippet=body[:200],  # First 200 chars
            status="Unread"
        )
        session.add(email)
        await session.commit()
        await session.refresh(email)
        
        return {
            "email_id": email.email_id,
            "sender": email.sender,
            "recipient": email.recipient,
            "subject": email.subject,
            "sent_at": email.date_received.isoformat()
        }


async def get_emails(recipient: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetches inbox with optional filters.
    
    Args:
        recipient: Filter by recipient email
        status: Filter by status (Read, Unread, Pending)
    
    Returns:
        List of email dictionaries
    """
    async with AsyncSession(engine) as session:
        query = select(Email)
        
        if recipient:
            query = query.where(Email.recipient == recipient)
        if status:
            query = query.where(Email.status == status)
        
        result = await session.exec(query)
        emails = result.all()
        
        return [
            {
                "email_id": e.email_id,
                "sender": e.sender,
                "recipient": e.recipient,
                "subject": e.subject,
                "body_snippet": e.body_snippet,
                "status": e.status,
                "date_received": e.date_received.isoformat()
            }
            for e in emails
        ]


async def mark_read(email_id: str) -> Dict[str, Any]:
    """Marks email as read.
    
    Args:
        email_id: Email identifier
    
    Returns:
        Dict with confirmation
    """
    async with AsyncSession(engine) as session:
        result = await session.exec(select(Email).where(Email.email_id == email_id))
        email = result.first()
        
        if not email:
            return {"error": f"Email {email_id} not found"}
        
        email.status = "Read"
        await session.commit()
        
        return {
            "email_id": email.email_id,
            "status": email.status
        }


async def extract_approval(email_id: str) -> Dict[str, Any]:
    """Parses email for approval actions.
    
    Args:
        email_id: Email identifier
    
    Returns:
        Dict with extracted approval information
    """
    async with AsyncSession(engine) as session:
        result = await session.exec(select(Email).where(Email.email_id == email_id))
        email = result.first()
        
        if not email:
            return {"error": f"Email {email_id} not found"}
        
        # Simple keyword extraction (in production, use NLP)
        body = email.body_snippet.lower()
        
        approval_data = {
            "email_id": email.email_id,
            "subject": email.subject,
            "contains_approval_request": "approve" in body or "approval" in body,
            "contains_rejection": "reject" in body or "denied" in body,
            "extracted_action": None
        }
        
        if "approve" in body:
            approval_data["extracted_action"] = "approve"
        elif "reject" in body:
            approval_data["extracted_action"] = "reject"
        
        return approval_data
