"""
M365 User Management MCP Server
Built with official FastMCP SDK
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from fastmcp import FastMCP
from app.tools.user_management_tools import (
    get_user_roles,
    create_user,
    generate_token,
    list_users,
    deactivate_user
)

# Initialize FastMCP server
mcp = FastMCP("M365_UserManagement")

@mcp.tool()
async def get_m365_user_roles(user_email: str) -> dict:
    """Fetches roles for a user by email.
    
    Args:
        user_email: User email address
    """
    return await get_user_roles(user_email)


@mcp.tool()
async def create_m365_user(
    email: str,
    username: str,
    password: str,
    role: str = "user"
) -> dict:
    """Creates a new user with hashed password.
    
    Args:
        email: User email (must be unique)
        username: Display name
        password: Initial password
        role: User role (user, admin, approver, supervisor)
    """
    return await create_user(email, username, password, role)


@mcp.tool()
async def generate_m365_token(user_email: str) -> dict:
    """Generates a JWT token for a user.
    
    Args:
        user_email: User email
    """
    return await generate_token(user_email)


@mcp.tool()
async def list_m365_users(
    status: str = None,
    role: str = None
) -> list:
    """Lists users with optional filters.
    
    Args:
        status: Filter by status (Active, Inactive, Pending)
        role: Filter by role (user, admin, approver, supervisor)
    """
    return await list_users(status, role)


@mcp.tool()
async def deactivate_m365_user(user_email: str) -> dict:
    """Sets user status to Inactive.
    
    Args:
        user_email: User email to deactivate
    """
    return await deactivate_user(user_email)


if __name__ == "__main__":
    mcp.run(transport="streamable-http", port=8004)
