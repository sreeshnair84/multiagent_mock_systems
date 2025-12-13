"""
MCP Client Configuration
Uses official LangChain MCP adapters with streamable-http transport for FastMCP servers
"""
from langchain_mcp_adapters.client import MultiServerMCPClient
import logging

logger = logging.getLogger(__name__)


# MCP Server Configuration
# Using streamable-http transport for FastMCP servers
MCP_SERVERS = {
    "servicenow": {
        "transport": "http",
        "url": "http://localhost:8001/mcp",
    },
    "intune": {
        "transport": "http",
        "url": "http://localhost:8002/mcp",
    },
    "m365": {
        "transport": "http",
        "url": "http://localhost:8004/mcp",
    },
    "access": {
        "transport": "http",
        "url": "http://localhost:8005/mcp",
    },
    "outlook": {
        "transport": "http",
        "url": "http://localhost:8006/mcp",
    },
    "workflow": {
        "transport": "http",
        "url": "http://localhost:8007/mcp",
    },
}


async def get_mcp_client():
    """Get configured MCP client with all servers"""
    client = MultiServerMCPClient(MCP_SERVERS)
    return client


async def get_tools_for_server(server_name: str):
    """Get tools from a specific MCP server
    
    Args:
        server_name: Name of the server (servicenow, intune, m365, access, outlook, workflow)
    
    Returns:
        List of LangChain tools from the server
    """
    if server_name not in MCP_SERVERS:
        logger.error(f"Unknown server: {server_name}")
        return []
    
    # Create client with just this server
    client = MultiServerMCPClient({server_name: MCP_SERVERS[server_name]})
    tools = await client.get_tools()
    return tools


async def get_all_tools():
    """Get all tools from all MCP servers"""
    client = await get_mcp_client()
    tools = await client.get_tools()
    return tools
