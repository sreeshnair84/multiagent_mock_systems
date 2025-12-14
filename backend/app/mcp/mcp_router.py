"""
MCP Router - Path-Based Routing for All MCP Servers
Mounts all MCP servers under /mcp/{server_name} paths to reduce resource usage
"""
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

logger = logging.getLogger(__name__)

def create_mcp_router() -> APIRouter:
    """
    Creates a unified router that mounts all MCP servers as sub-applications.
    
    Each server is accessible at /mcp/{server_name}:
    - /mcp/servicenow
    - /mcp/intune
    - /mcp/m365
    - /mcp/access
    - /mcp/outlook
    - /mcp/workflow
    
    Returns:
        APIRouter with all MCP servers mounted
    """
    # Import all MCP server instances
    from app.mcp.servers.servicenow_mcp import mcp as servicenow_mcp
    from app.mcp.servers.intune_mcp import mcp as intune_mcp
    from app.mcp.servers.m365_mcp import mcp as m365_mcp
    from app.mcp.servers.access_mcp import mcp as access_mcp
    from app.mcp.servers.outlook_mcp import mcp as outlook_mcp
    from app.mcp.servers.workflow_mcp import mcp as workflow_mcp
    
    # Create main app to mount sub-applications
    main_app = FastAPI(title="MCP Servers")
    
    # Server configurations: (name, mcp_instance, path)
    servers = [
        ("ServiceNow", servicenow_mcp, "/servicenow"),
        ("Intune", intune_mcp, "/intune"),
        ("M365", m365_mcp, "/m365"),
        ("Access Management", access_mcp, "/access"),
        ("Outlook", outlook_mcp, "/outlook"),
        ("Workflow", workflow_mcp, "/workflow"),
    ]
    
    # Mount each MCP server as a sub-application
    for server_name, mcp_instance, path in servers:
        try:
            # Get the ASGI app from FastMCP instance
            # FastMCP exposes the app via the _app attribute or get_asgi_app() method
            if hasattr(mcp_instance, 'get_asgi_app'):
                server_app = mcp_instance.get_asgi_app()
            elif hasattr(mcp_instance, '_app'):
                server_app = mcp_instance._app
            else:
                # Fallback: create the app by calling the internal method
                server_app = mcp_instance._create_app()
            
            # Add CORS middleware to each server app for MCP Inspector compatibility
            server_app.add_middleware(
                CORSMiddleware,
                allow_origins=["*"],
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"],
                expose_headers=["*"],
            )
            
            # Mount the server app
            main_app.mount(path, server_app)
            logger.info(f"✓ Mounted {server_name} MCP server at /mcp{path}")
            
        except Exception as e:
            logger.error(f"✗ Failed to mount {server_name} MCP server: {e}")
            raise
    
    # Create a router and mount the main app
    router = APIRouter(prefix="/mcp", tags=["MCP Servers"])
    
    # Add a root endpoint for MCP listing
    @router.get("/")
    async def list_mcp_servers():
        """List all available MCP servers"""
        return {
            "message": "MCP Servers - Path-Based Routing",
            "servers": [
                {"name": "ServiceNow", "path": "/mcp/servicenow", "description": "ServiceNow ticket management"},
                {"name": "Intune", "path": "/mcp/intune", "description": "Device provisioning and management"},
                {"name": "M365", "path": "/mcp/m365", "description": "User management and authentication"},
                {"name": "Access Management", "path": "/mcp/access", "description": "Access requests and approvals"},
                {"name": "Outlook", "path": "/mcp/outlook", "description": "Email operations"},
                {"name": "Workflow", "path": "/mcp/workflow", "description": "Workflow orchestration"},
            ]
        }
    
    # Mount the main app with all MCP servers into the router
    # Note: We need to return the main_app directly since APIRouter doesn't support mounting
    return main_app


# Export the router
mcp_app = create_mcp_router()
