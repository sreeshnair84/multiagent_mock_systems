"""
LangGraph MCP Client for accessing MCP tools via HTTP
"""
from typing import List, Optional
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_core.tools import BaseTool
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class MCPClientManager:
    """
    Manages MCP client connections and tool retrieval for LangGraph agents
    """
    
    def __init__(self):
        self._client: Optional[MultiServerMCPClient] = None
        self._tools_cache: Optional[List[BaseTool]] = None
        
    async def get_client(self) -> MultiServerMCPClient:
        """
        Get or create MCP client instance
        """
        if self._client is None:
            logger.info(f"Initializing MCP client with URL: {settings.MCP_COMPOSITE_URL}")
            
            # Configure composite server connection
            server_config = {
                "composite": {
                    "transport": settings.MCP_TRANSPORT,
                    "url": settings.MCP_COMPOSITE_URL,
                }
            }
            
            self._client = MultiServerMCPClient(server_config)
            logger.info("MCP client initialized successfully")
            
        return self._client
    
    async def get_all_tools(self, force_refresh: bool = False) -> List[BaseTool]:
        """
        Get all tools from the MCP composite server
        
        Args:
            force_refresh: Force refresh the tools cache
            
        Returns:
            List of LangChain tools from MCP server
        """
        if self._tools_cache is None or force_refresh:
            try:
                client = await self.get_client()
                self._tools_cache = await client.get_tools()
                logger.info(f"Retrieved {len(self._tools_cache)} tools from MCP server")
            except Exception as e:
                logger.error(f"Failed to get tools from MCP server: {e}")
                raise
                
        return self._tools_cache
    
    async def get_tools_by_prefix(self, prefix: str) -> List[BaseTool]:
        """
        Get tools filtered by name prefix (e.g., 'servicenow_', 'intune_')
        
        Args:
            prefix: Tool name prefix to filter by
            
        Returns:
            List of filtered tools
        """
        all_tools = await self.get_all_tools()
        filtered_tools = [tool for tool in all_tools if tool.name.startswith(prefix)]
        logger.info(f"Found {len(filtered_tools)} tools with prefix '{prefix}'")
        return filtered_tools
    
    async def get_tools_by_names(self, tool_names: List[str]) -> List[BaseTool]:
        """
        Get specific tools by their exact names
        
        Args:
            tool_names: List of tool names to retrieve
            
        Returns:
            List of matching tools
        """
        all_tools = await self.get_all_tools()
        tool_dict = {tool.name: tool for tool in all_tools}
        
        filtered_tools = []
        for name in tool_names:
            if name in tool_dict:
                filtered_tools.append(tool_dict[name])
            else:
                logger.warning(f"Tool '{name}' not found in MCP server")
                
        logger.info(f"Found {len(filtered_tools)} out of {len(tool_names)} requested tools")
        return filtered_tools
    
    async def close(self):
        """
        Close the MCP client connection
        """
        if self._client is not None:
            # MultiServerMCPClient doesn't have explicit close, but we clear cache
            self._tools_cache = None
            self._client = None
            logger.info("MCP client closed")


# Global MCP client manager instance
mcp_manager = MCPClientManager()


async def get_mcp_tools(prefix: Optional[str] = None, tool_names: Optional[List[str]] = None) -> List[BaseTool]:
    """
    Convenience function to get MCP tools
    
    Args:
        prefix: Optional prefix to filter tools by
        tool_names: Optional list of specific tool names
        
    Returns:
        List of LangChain tools from MCP server
    """
    if tool_names:
        return await mcp_manager.get_tools_by_names(tool_names)
    elif prefix:
        return await mcp_manager.get_tools_by_prefix(prefix)
    else:
        return await mcp_manager.get_all_tools()
