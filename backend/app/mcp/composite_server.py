"""
EnterpriseHub Composite MCP Server
Combines all individual MCP servers into a single unified server using FastMCP composition.
Uses mount() for live linking - simpler and more reliable than import_server().

EnterpriseHub provides unified access to:
- ServiceNow ticket management
- Intune device management
- M365 user management
- Access control workflows
- Outlook email operations
- Workflow orchestration
"""
import sys
import os

# Add backend directory to path so we can import app modules
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastmcp import FastMCP

# Import sub-servers
from app.mcp.servers.servicenow_mcp import mcp as servicenow_mcp
from app.mcp.servers.intune_mcp import mcp as intune_mcp
from app.mcp.servers.m365_mcp import mcp as m365_mcp
from app.mcp.servers.access_mcp import mcp as access_mcp
from app.mcp.servers.outlook_mcp import mcp as outlook_mcp
from app.mcp.servers.workflow_mcp import mcp as workflow_mcp

# Create the main composite server
mcp = FastMCP("EnterpriseHub")

# Mount all sub-servers with prefixes for organization
# Using mount() instead of import_server() for:
# - Synchronous operation (no async complexity)
# - Live linking (changes to sub-servers reflected immediately)
# - Simpler code and better MCP Inspector compatibility
mcp.mount(servicenow_mcp, prefix="servicenow")
mcp.mount(intune_mcp, prefix="intune")
mcp.mount(m365_mcp, prefix="m365")
mcp.mount(access_mcp, prefix="access")
mcp.mount(outlook_mcp, prefix="outlook")
mcp.mount(workflow_mcp, prefix="workflow")

if __name__ == "__main__":
    # Start the composite server with configured transport (HTTP with CORS by default)
    from app.mcp.config import run_server
    run_server(mcp, "EnterpriseHub")
