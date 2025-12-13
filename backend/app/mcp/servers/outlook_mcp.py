"""
Outlook MCP Server
Built with official FastMCP SDK
"""
from fastmcp import FastMCP
from app.tools.outlook_tools import (
    send_email,
    get_emails,
    mark_read,
    extract_approval
)

# Initialize FastMCP server
mcp = FastMCP("Outlook")

@mcp.tool()
async def send_outlook_email(
    sender: str,
    recipient: str,
    subject: str,
    body: str
) -> dict:
    """Sends an email.
    
    Args:
        sender: Sender email
        recipient: Recipient email
        subject: Email subject
        body: Email body
    """
    return await send_email(sender, recipient, subject, body)


@mcp.tool()
async def get_outlook_emails(
    recipient: str = None,
    status: str = None
) -> list:
    """Fetches emails with optional filters.
    
    Args:
        recipient: Filter by recipient
        status: Filter by status (Unread, Read, Pending)
    """
    return await get_emails(recipient, status)


@mcp.tool()
async def mark_outlook_email_read(email_id: str) -> dict:
    """Marks an email as read.
    
    Args:
        email_id: Email identifier
    """
    return await mark_read(email_id)


@mcp.tool()
async def extract_outlook_approval(email_id: str) -> dict:
    """Extracts approval action from email content.
    
    Args:
        email_id: Email identifier
    """
    return await extract_approval(email_id)


if __name__ == "__main__":
    mcp.run(transport="streamable-http", port=8006)
