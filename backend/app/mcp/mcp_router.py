"""
MCP Router - Path-Based Routing for All MCP Servers
Mounts all MCP servers under /mcp/{server_name} paths to reduce resource usage
"""
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import logging

logger = logging.getLogger(__name__)

# Create router for MCP servers
router = APIRouter(prefix="/mcp", tags=["MCP Servers"])

@router.get("/")
async def list_mcp_servers():
    """List all available MCP servers"""
    return {
        "message": "MCP Servers - Path-Based Routing",
        "note": "Currently servers run on separate ports. Path-based mounting will be enabled when FastMCP adds router support (see GitHub #1494)",
        "servers": [
            {"name": "ServiceNow", "path": "/mcp/servicenow", "port": 8001, "description": "ServiceNow ticket management"},
            {"name": "Intune", "path": "/mcp/intune", "port": 8002, "description": "Device provisioning and management"},
            {"name": "M365", "path": "/mcp/m365", "port": 8004, "description": "User management and authentication"},
            {"name": "Access Management", "path": "/mcp/access", "port": 8005, "description": "Access requests and approvals"},
            {"name": "Outlook", "path": "/mcp/outlook", "port": 8006, "description": "Email operations"},
            {"name": "Workflow", "path": "/mcp/workflow", "port": 8007, "description": "Workflow orchestration"},
        ],
        "current_access": "Use http://localhost:{port} for each server",
        "future_access": "Will use /mcp/{server_name} when mounting is enabled"
    }


def mount_mcp_servers(app: FastAPI):
    """
    Mount all MCP servers as sub-applications to the main FastAPI app.
    
    This function should be called during app startup to mount MCP servers.
    Each server will be accessible at /mcp/{server_name}.
    
    Args:
        app: The main FastAPI application
    """
    try:
        logger.info("Mounting MCP servers...")
        
        # Import all MCP server instances
        from app.mcp.servers.servicenow_mcp import mcp as servicenow_mcp
        from app.mcp.servers.intune_mcp import mcp as intune_mcp
        from app.mcp.servers.m365_mcp import mcp as m365_mcp
        from app.mcp.servers.access_mcp import mcp as access_mcp
        from app.mcp.servers.outlook_mcp import mcp as outlook_mcp
        from app.mcp.servers.workflow_mcp import mcp as workflow_mcp
        
        # Server configurations
        servers = [
            ("ServiceNow", servicenow_mcp, "/mcp/servicenow"),
            ("Intune", intune_mcp, "/mcp/intune"),
            ("M365", m365_mcp, "/mcp/m365"),
            ("Access Management", access_mcp, "/mcp/access"),
            ("Outlook", outlook_mcp, "/mcp/outlook"),
            ("Workflow", workflow_mcp, "/mcp/workflow"),
        ]
        
        for server_name, mcp_instance, path in servers:
            try:
                # Use FastMCP's http_app() method to get the ASGI application
                server_app = mcp_instance.http_app()
                
                # Add CORS middleware
                server_app.add_middleware(
                    CORSMiddleware,
                    allow_origins=["*"],
                    allow_credentials=True,
                    allow_methods=["*"],
                    allow_headers=["*"],
                    expose_headers=["*"],
                )
                
                # Mount the server app
                app.mount(path, server_app)
                logger.info(f"✓ Mounted {server_name} MCP server at {path}")
                
            except Exception as e:
                logger.error(f"✗ Failed to mount {server_name} MCP server: {e}")
                logger.warning(f"  {server_name} will need to run as a separate process")
        
        logger.info("MCP server mounting complete")
        
    except Exception as e:
        logger.error(f"Failed to mount MCP servers: {e}")
        import traceback
        traceback.print_exc()
