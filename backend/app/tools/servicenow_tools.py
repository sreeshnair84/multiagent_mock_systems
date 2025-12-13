"""
ServiceNow Agent Tools
Handles ticket creation, retrieval, updates, and escalation
Exposed via MCP server, not as LangChain tools
"""
from typing import List, Dict, Any, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime
import json

from app.models import Ticket
from app.core.database import engine


async def create_ticket(
    title: str, 
    description: str, 
    priority: str = "Medium",
    category: Optional[str] = None,
    requester_email: Optional[str] = None,
    tags: Optional[str] = None
) -> Dict[str, Any]:
    """Creates a new ServiceNow ticket with validation.
    
    Args:
        title: Ticket title
        description: Detailed description
        priority: Low, Medium, High, or Critical (default: Medium)
        category: Category (Hardware, Software, Network, etc.)
        requester_email: Email of person requesting ticket
        tags: Comma-separated tags
    
    Returns:
        Dict with ticket details including ticket_id
    """
    async with AsyncSession(engine) as session:
        # Generate ticket ID
        result = await session.execute(select(Ticket))
        existing_tickets = result.scalars().all()
        ticket_num = len(existing_tickets) + 1
        ticket_id = f"INC{ticket_num:07d}"
        
        ticket = Ticket(
            ticket_id=ticket_id,
            title=title,
            description=description,
            priority=priority,
            category=category,
            requester_email=requester_email,
            tags=tags,
            status="Open"
        )
        session.add(ticket)
        await session.commit()
        await session.refresh(ticket)
        
        return {
            "ticket_id": ticket.ticket_id,
            "title": ticket.title,
            "status": ticket.status,
            "priority": ticket.priority,
            "category": ticket.category,
            "created_date": ticket.created_date.isoformat()
        }


async def get_ticket(ticket_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves ticket details by ID.
    
    Args:
        ticket_id: Ticket identifier (e.g., INC0000001)
    
    Returns:
        Dict with ticket details or None if not found
    """
    async with AsyncSession(engine) as session:
        result = await session.execute(select(Ticket).where(Ticket.ticket_id == ticket_id))
        ticket = result.scalars().first()
        
        if not ticket:
            return None
        
        return {
            "ticket_id": ticket.ticket_id,
            "title": ticket.title,
            "description": ticket.description,
            "status": ticket.status,
            "priority": ticket.priority,
            "impact": ticket.impact,
            "category": ticket.category,
            "subcategory": ticket.subcategory,
            "assignee_email": ticket.assignee_email,
            "requester_email": ticket.requester_email,
            "work_notes": json.loads(ticket.work_notes),
            "tags": ticket.tags,
            "closing_notes": ticket.closing_notes,
            "created_date": ticket.created_date.isoformat(),
            "updated_date": ticket.updated_date.isoformat()
        }


async def update_ticket_status(
    ticket_id: str, 
    status: str, 
    assignee_email: Optional[str] = None,
    closing_notes: Optional[str] = None
) -> Dict[str, Any]:
    """Updates ticket status and optionally assigns to a user.
    
    Args:
        ticket_id: Ticket identifier
        status: New status (Open, In Progress, Resolved, Closed, Cancelled)
        assignee_email: Optional email to assign ticket to
        closing_notes: Notes when closing/resolving ticket
    
    Returns:
        Dict with updated ticket details
    """
    async with AsyncSession(engine) as session:
        result = await session.execute(select(Ticket).where(Ticket.ticket_id == ticket_id))
        ticket = result.scalars().first()
        
        if not ticket:
            return {"error": f"Ticket {ticket_id} not found"}
        
        ticket.status = status
        ticket.updated_date = datetime.utcnow()
        
        if assignee_email:
            ticket.assignee_email = assignee_email
        
        if status in ["Resolved", "Closed"]:
            if status == "Resolved":
                ticket.resolved_date = datetime.utcnow()
            if status == "Closed":
                ticket.closed_date = datetime.utcnow()
            if closing_notes:
                ticket.closing_notes = closing_notes
        
        await session.commit()
        await session.refresh(ticket)
        
        return {
            "ticket_id": ticket.ticket_id,
            "status": ticket.status,
            "assignee_email": ticket.assignee_email,
            "updated_date": ticket.updated_date.isoformat()
        }


async def add_work_note(ticket_id: str, note: str, author_email: str) -> Dict[str, Any]:
    """Adds a work note to a ticket.
    
    Args:
        ticket_id: Ticket identifier
        note: Work note content
        author_email: Email of person adding note
    
    Returns:
        Dict with confirmation
    """
    async with AsyncSession(engine) as session:
        result = await session.execute(select(Ticket).where(Ticket.ticket_id == ticket_id))
        ticket = result.scalars().first()
        
        if not ticket:
            return {"error": f"Ticket {ticket_id} not found"}
        
        # Parse existing work notes
        work_notes = json.loads(ticket.work_notes)
        
        # Add new note
        work_notes.append({
            "author": author_email,
            "note": note,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        ticket.work_notes = json.dumps(work_notes)
        ticket.updated_date = datetime.utcnow()
        
        await session.commit()
        
        return {
            "ticket_id": ticket.ticket_id,
            "note_added": True,
            "total_notes": len(work_notes)
        }


async def update_ticket_tags(ticket_id: str, tags: str) -> Dict[str, Any]:
    """Updates ticket tags.
    
    Args:
        ticket_id: Ticket identifier
        tags: Comma-separated tags
    
    Returns:
        Dict with confirmation
    """
    async with AsyncSession(engine) as session:
        result = await session.execute(select(Ticket).where(Ticket.ticket_id == ticket_id))
        ticket = result.scalars().first()
        
        if not ticket:
            return {"error": f"Ticket {ticket_id} not found"}
        
        ticket.tags = tags
        ticket.updated_date = datetime.utcnow()
        
        await session.commit()
        
        return {
            "ticket_id": ticket.ticket_id,
            "tags": ticket.tags
        }


async def search_tickets(
    user_email: Optional[str] = None, 
    priority: Optional[str] = None, 
    status: Optional[str] = None,
    category: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Queries tickets with optional filters.
    
    Args:
        user_email: Filter by assignee email
        priority: Filter by priority (Low, Medium, High, Critical)
        status: Filter by status (Open, In Progress, Resolved, Closed, Cancelled)
        category: Filter by category
    
    Returns:
        List of ticket dictionaries
    """
    async with AsyncSession(engine) as session:
        query = select(Ticket)
        
        if user_email:
            query = query.where(Ticket.assignee_email == user_email)
        if priority:
            query = query.where(Ticket.priority == priority)
        if status:
            query = query.where(Ticket.status == status)
        if category:
            query = query.where(Ticket.category == category)
        
        result = await session.execute(query)
        tickets = result.scalars().all()
        
        return [
            {
                "ticket_id": t.ticket_id,
                "title": t.title,
                "status": t.status,
                "priority": t.priority,
                "category": t.category,
                "assignee_email": t.assignee_email,
                "created_date": t.created_date.isoformat()
            }
            for t in tickets
        ]


async def escalate_ticket(ticket_id: str, reason: str) -> Dict[str, Any]:
    """Escalates ticket to higher priority with reason logging.
    
    Args:
        ticket_id: Ticket identifier
        reason: Reason for escalation
    
    Returns:
        Dict with escalation confirmation
    """
    async with AsyncSession(engine) as session:
        result = await session.execute(select(Ticket).where(Ticket.ticket_id == ticket_id))
        ticket = result.scalars().first()
        
        if not ticket:
            return {"error": f"Ticket {ticket_id} not found"}
        
        # Escalate priority
        priority_map = {"Low": "Medium", "Medium": "High", "High": "Critical", "Critical": "Critical"}
        old_priority = ticket.priority
        ticket.priority = priority_map.get(old_priority, "Critical")
        ticket.description += f"\n\n[ESCALATED] {reason}"
        ticket.updated_date = datetime.utcnow()
        
        await session.commit()
        await session.refresh(ticket)
        
        return {
            "ticket_id": ticket.ticket_id,
            "old_priority": old_priority,
            "new_priority": ticket.priority,
            "reason": reason,
            "escalated_at": ticket.updated_date.isoformat()
        }
