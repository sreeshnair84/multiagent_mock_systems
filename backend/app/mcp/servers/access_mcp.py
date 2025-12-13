"""
Access Management MCP Server
Built with official FastMCP SDK
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from fastmcp import FastMCP
from app.tools.access_management_tools import (
    submit_access_request,
    approve_request,
    get_workflow_status,
    notify_approver,
    onboard_user
)

# Initialize FastMCP server
mcp = FastMCP("AccessManagement")

@mcp.tool()
async def submit_access_management_request(
    user_email: str,
    resource: str,
    action: str
) -> dict:
    """Creates a new access request for approval.
    
    Args:
        user_email: User requesting access
        resource: Resource to access (e.g., SAP Module A)
        action: Action requested (Read, Write, Admin)
    """
    return await submit_access_request(user_email, resource, action)


@mcp.tool()
async def approve_access_request(
    request_id: str,
    approver_email: str,
    approved: bool,
    reason: str = None
) -> dict:
    """Approves or rejects an access request (requires Approver role).
    
    Args:
        request_id: Request identifier
        approver_email: Email of approver
        approved: True to approve, False to reject
        reason: Optional reason for rejection
    """
    return await approve_request(request_id, approver_email, approved, reason)


@mcp.tool()
async def get_access_workflow_status(
    request_id: str = None,
    user_email: str = None
) -> dict:
    """Checks status of access requests.
    
    Args:
        request_id: Optional specific request ID
        user_email: Optional filter by user email
    """
    return await get_workflow_status(request_id, user_email)


@mcp.tool()
async def notify_access_approver(
    request_id: str,
    approver_email: str
) -> dict:
    """Sends notification to approver about pending request.
    
    Args:
        request_id: Request identifier
        approver_email: Approver email
    """
    return await notify_approver(request_id, approver_email)


@mcp.tool()
async def onboard_new_user(
    email: str,
    username: str,
    password: str,
    device_serial: str = None
) -> dict:
    """Orchestrates full user onboarding workflow.
    
    Args:
        email: User email
        username: Display name
        password: Initial password
        device_serial: Optional device serial number to provision
    """
    return await onboard_user(email, username, password, device_serial)


if __name__ == "__main__":
    mcp.run(transport="streamable-http", port=8005)
