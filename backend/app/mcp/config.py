"""
MCP Server Configuration
Supports both stdio (for MCP Inspector) and streamable-http (for web clients) transports
"""
import os

# Transport mode: 'stdio' for MCP Inspector, 'http' for web clients
MCP_TRANSPORT = os.getenv("MCP_TRANSPORT", "http")

# Port for composite server (can be overridden by MCP_SERVER_PORT)
COMPOSITE_PORT = int(os.getenv("MCP_COMPOSITE_PORT", "8001"))

def run_server(mcp_instance, server_name: str, port: int = None):
    """
    Run MCP server with configured transport
    
    Args:
        mcp_instance: FastMCP instance
        server_name: Name of the server for logging
        port: Port number for HTTP transport (optional, uses default if not provided)
    """
    transport = MCP_TRANSPORT.lower()
    
    if transport == "stdio":
        print(f"Starting {server_name} MCP server with STDIO transport")
        print(f"Use with MCP Inspector: npx @modelcontextprotocol/inspector python <script_path>")
        mcp_instance.run()
    else:
        # Use HTTP transport with CORS
        # Check for port override from environment
        if port is None:
            port = int(os.getenv("MCP_SERVER_PORT", COMPOSITE_PORT))
            
        print(f"Starting {server_name} MCP server with Streamable HTTP transport")
        print(f"Server URL: http://localhost:{port}")
        print(f"CORS enabled for all origins")
        
        # Add CORS middleware
        from fastapi.middleware.cors import CORSMiddleware
        import uvicorn
        
        # Patch uvicorn.run to add CORS middleware
        original_uvicorn_run = uvicorn.run
        
        def patched_uvicorn_run(app, *args, **kwargs):
            # Add CORS middleware to the app
            if hasattr(app, 'add_middleware'):
                app.add_middleware(
                    CORSMiddleware,
                    allow_origins=["*"],
                    allow_credentials=True,
                    allow_methods=["*"],
                    allow_headers=["*"],
                    expose_headers=["*"],
                )
                print(f"✓ CORS middleware added to {server_name}")
            
            # Call original uvicorn.run
            return original_uvicorn_run(app, *args, **kwargs)
        
        # Temporarily replace uvicorn.run
        uvicorn.run = patched_uvicorn_run
        try:
            mcp_instance.run(
                transport="streamable-http",
                host="0.0.0.0",
                port=port,
                stateless_http=True
            )
        finally:
            # Restore original uvicorn.run
            uvicorn.run = original_uvicorn_run
