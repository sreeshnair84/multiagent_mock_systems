"""
MCP Server Startup Script
Starts all MCP servers in separate processes
"""
import subprocess
import sys
import time
from pathlib import Path

# MCP servers configuration
MCP_SERVERS = [
    {"name": "ServiceNow", "script": "app/mcp/servers/servicenow_mcp.py", "port": 8001},
    {"name": "Intune", "script": "app/mcp/servers/intune_mcp.py", "port": 8002},
    {"name": "M365_UserManagement", "script": "app/mcp/servers/m365_mcp.py", "port": 8004},
    {"name": "AccessManagement", "script": "app/mcp/servers/access_mcp.py", "port": 8005},
    {"name": "Outlook", "script": "app/mcp/servers/outlook_mcp.py", "port": 8006},
    {"name": "Workflow", "script": "app/mcp/servers/workflow_mcp.py", "port": 8007},
]


def start_mcp_servers():
    """Start all MCP servers as background processes"""
    processes = []
    
    print("Starting MCP servers...")
    
    for server in MCP_SERVERS:
        print(f"Starting {server['name']} on port {server['port']}...")
        
        # Start server process
        process = subprocess.Popen(
            [sys.executable, server['script']],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        processes.append({
            "name": server['name'],
            "port": server['port'],
            "process": process
        })
        
        time.sleep(1)  # Give server time to start
    
    print("\nAll MCP servers started!")
    print("\nServer Status:")
    for p in processes:
        status = "Running" if p['process'].poll() is None else "Failed"
        print(f"  {p['name']}: {status} on port {p['port']}")
    
    print("\nTo inspect servers, use MCP Inspector:")
    print("  npx @modelcontextprotocol/inspector")
    
    # Keep script running
    try:
        print("\nPress Ctrl+C to stop all servers...")
        while True:
            time.sleep(1)
            # Check if any process died
            for p in processes:
                if p['process'].poll() is not None:
                    print(f"\nWarning: {p['name']} server stopped unexpectedly!")
    
    except KeyboardInterrupt:
        print("\n\nStopping all MCP servers...")
        for p in processes:
            p['process'].terminate()
            p['process'].wait()
        print("All servers stopped.")


if __name__ == "__main__":
    start_mcp_servers()
