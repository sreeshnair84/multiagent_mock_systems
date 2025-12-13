"""
Intune MCP Server
Built with official FastMCP SDK
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from fastmcp import FastMCP
from app.tools.intune_tools import (
    provision_device,
    get_device_profile,
    update_device_status,
    list_devices,
    wipe_device
)

# Initialize FastMCP server
mcp = FastMCP("Intune")

@mcp.tool()
async def provision_intune_device(
    serial_number: str,
    user_email: str,
    profile_name: str = "Standard",
    os_version: str = "Unknown"
) -> dict:
    """Enrolls a device with profile assignment.
    
    Args:
        serial_number: Device serial number
        user_email: User email to assign device to
        profile_name: Profile to assign (Standard, Mobile, Executive)
        os_version: Operating system version
    """
    return await provision_device(serial_number, user_email, profile_name, os_version)


@mcp.tool()
async def get_intune_device_profile(device_id: str) -> dict:
    """Fetches device configuration and profile details.
    
    Args:
        device_id: Device identifier
    """
    return await get_device_profile(device_id)


@mcp.tool()
async def update_intune_device_status(device_id: str, status: str) -> dict:
    """Changes device enrollment status.
    
    Args:
        device_id: Device identifier
        status: New status (Enrolled, Pending, Failed, Wiped)
    """
    return await update_device_status(device_id, status)


@mcp.tool()
async def list_intune_devices(
    user_email: str = None,
    status: str = None
) -> list:
    """Lists devices with optional filters.
    
    Args:
        user_email: Filter by user email
        status: Filter by status
    """
    return await list_devices(user_email, status)


@mcp.tool()
async def wipe_intune_device(
    device_id: str,
    admin_email: str,
    confirmation: bool = False
) -> dict:
    """Wipes device data (admin-only operation with confirmation).
    
    Args:
        device_id: Device identifier
        admin_email: Admin user email
        confirmation: Must be True to proceed with wipe
    """
    return await wipe_device(device_id, admin_email, confirmation)


if __name__ == "__main__":
    mcp.run(transport="streamable-http", port=8002)
