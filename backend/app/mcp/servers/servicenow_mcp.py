"""
ServiceNow MCP Server
Built with official FastMCP SDK
"""
from fastmcp import FastMCP
from app.tools.servicenow_tools import (
    create_ticket,
    get_ticket,
    update_ticket_status,
    add_work_note,
    update_ticket_tags,
    search_tickets,
    escalate_ticket
)

# Initialize FastMCP server
mcp = FastMCP("ServiceNow")

# Register tools
@mcp.tool()
async def create_servicenow_ticket(
    title: str,
    description: str,
    priority: str = "Medium",
    category: str = "General",
    requester_email: str = None,
    tags: str = None
) -> dict:
    """Creates a new ServiceNow ticket with validation.
    
    Args:
        title: Ticket title
        description: Detailed description
        priority: Priority level (Low, Medium, High, Critical)
        category: Category (Hardware, Software, Network, etc.)
        requester_email: Email of person requesting ticket
        tags: Comma-separated tags
    """
    return await create_ticket(title, description, priority, category, requester_email, tags)


@mcp.tool()
async def get_servicenow_ticket(ticket_id: str) -> dict:
    """Retrieves ticket details by ID.
    
    Args:
        ticket_id: Ticket identifier (e.g., INC0000001)
    """
    return await get_ticket(ticket_id)


@mcp.tool()
async def update_servicenow_ticket_status(
    ticket_id: str,
    status: str,
    assignee_email: str = None,
    closing_notes: str = None
) -> dict:
    """Updates ticket status and optionally assigns to a user.
    
    Args:
        ticket_id: Ticket identifier
        status: New status (Open, In Progress, Resolved, Closed, Cancelled)
        assignee_email: Optional email to assign ticket to
        closing_notes: Notes when closing/resolving ticket
    """
    return await update_ticket_status(ticket_id, status, assignee_email, closing_notes)


@mcp.tool()
async def add_servicenow_work_note(
    ticket_id: str,
    note: str,
    author_email: str
) -> dict:
    """Adds a work note to a ticket.
    
    Args:
        ticket_id: Ticket identifier
        note: Work note content
        author_email: Email of person adding note
    """
    return await add_work_note(ticket_id, note, author_email)


@mcp.tool()
async def update_servicenow_ticket_tags(
    ticket_id: str,
    tags: str
) -> dict:
    """Updates ticket tags (comma-separated).
    
    Args:
        ticket_id: Ticket identifier
        tags: Comma-separated tags
    """
    return await update_ticket_tags(ticket_id, tags)


@mcp.tool()
async def search_servicenow_tickets(
    user_email: str = None,
    priority: str = None,
    status: str = None,
    category: str = None
) -> list:
    """Queries tickets with optional filters.
    
    Args:
        user_email: Filter by assignee email
        priority: Filter by priority
        status: Filter by status
        category: Filter by category
    """
    return await search_tickets(user_email, priority, status, category)


@mcp.tool()
async def escalate_servicenow_ticket(
    ticket_id: str,
    reason: str
) -> dict:
    """Escalates ticket to higher priority with reason logging.
    
    Args:
        ticket_id: Ticket identifier
        reason: Reason for escalation
    """
    return await escalate_ticket(ticket_id, reason)


if __name__ == "__main__":
    # Run with streamable-http transport for MCP protocol
    mcp.run(transport="streamable-http", port=8001)
