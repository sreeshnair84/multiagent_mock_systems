"""
Base MCP Server Implementation
Provides JSON-RPC interface for tool invocation
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Callable, List, Optional
import inspect
import logging

logger = logging.getLogger(__name__)


class ToolInvocation(BaseModel):
    """Request model for tool invocation"""
    tool_name: str
    parameters: Dict[str, Any] = {}


class ToolResponse(BaseModel):
    """Response model for tool invocation"""
    success: bool
    result: Optional[Any] = None
    error: Optional[str] = None


class MCPServer:
    """Base MCP Server class for exposing tools via JSON-RPC"""
    
    def __init__(self, name: str, port: int):
        self.name = name
        self.port = port
        self.app = FastAPI(title=f"{name} MCP Server")
        self.tools: Dict[str, Callable] = {}
        
        # Register routes
        self._register_routes()
    
    def register_tool(self, name: str, func: Callable):
        """Register a tool function"""
        self.tools[name] = func
        logger.info(f"Registered tool: {name}")
    
    def _register_routes(self):
        """Register FastAPI routes"""
        
        @self.app.get("/")
        async def root():
            return {
                "server": self.name,
                "tools": list(self.tools.keys()),
                "protocol": "MCP"
            }
        
        @self.app.get("/tools")
        async def list_tools():
            """List all available tools"""
            tool_list = []
            for name, func in self.tools.items():
                sig = inspect.signature(func)
                params = {
                    param_name: {
                        "type": str(param.annotation) if param.annotation != inspect.Parameter.empty else "Any",
                        "default": str(param.default) if param.default != inspect.Parameter.empty else None
                    }
                    for param_name, param in sig.parameters.items()
                }
                
                tool_list.append({
                    "name": name,
                    "description": func.__doc__ or "No description",
                    "parameters": params
                })
            
            return {"tools": tool_list}
        
        @self.app.post("/tools/{tool_name}/invoke")
        async def invoke_tool(tool_name: str, invocation: ToolInvocation):
            """Invoke a tool by name with parameters"""
            if tool_name not in self.tools:
                raise HTTPException(status_code=404, detail=f"Tool {tool_name} not found")
            
            try:
                func = self.tools[tool_name]
                
                # Call the tool function
                if inspect.iscoroutinefunction(func):
                    result = await func(**invocation.parameters)
                else:
                    result = func(**invocation.parameters)
                
                return ToolResponse(success=True, result=result)
            
            except Exception as e:
                logger.error(f"Error invoking tool {tool_name}: {str(e)}")
                return ToolResponse(success=False, error=str(e))
        
        @self.app.post("/invoke")
        async def invoke_generic(invocation: ToolInvocation):
            """Generic invocation endpoint"""
            return await invoke_tool(invocation.tool_name, invocation)
    
    def run(self):
        """Run the MCP server"""
        import uvicorn
        logger.info(f"Starting {self.name} MCP Server on port {self.port}")
        uvicorn.run(self.app, host="0.0.0.0", port=self.port)
