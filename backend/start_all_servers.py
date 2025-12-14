"""
Multi-Server Startup Script
Starts all MCP servers on different ports + composite server
"""
import sys
import os
import subprocess
import time

# Add backend to path
backend_dir = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, backend_dir)

# Server configurations
SERVERS = {
    "EnterpriseHub (Composite)": {
        "script": "app/mcp/composite_server.py",
        "port": 8000,
        "description": "All tools unified"
    },
    "ServiceNow": {
        "script": "app/mcp/servers/servicenow_mcp.py",
        "port": 8001,
        "description": "Ticket management"
    },
    "Intune": {
        "script": "app/mcp/servers/intune_mcp.py",
        "port": 8002,
        "description": "Device management"
    },
    "M365": {
        "script": "app/mcp/servers/m365_mcp.py",
        "port": 8003,
        "description": "User management"
    },
    "Access": {
        "script": "app/mcp/servers/access_mcp.py",
        "port": 8004,
        "description": "Access control"
    },
    "Outlook": {
        "script": "app/mcp/servers/outlook_mcp.py",
        "port": 8005,
        "description": "Email operations"
    },
    "Workflow": {
        "script": "app/mcp/servers/workflow_mcp.py",
        "port": 8006,
        "description": "Workflow orchestration"
    }
}

def start_server(name, config):
    """Start a single server"""
    print(f"\n🚀 Starting {name} on port {config['port']}...")
    print(f"   {config['description']}")
    
    env = os.environ.copy()
    env["MCP_TRANSPORT"] = "http"
    env["MCP_SERVER_PORT"] = str(config['port'])
    
    # Start server in background
    process = subprocess.Popen(
        [sys.executable, config['script']],
        env=env,
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    return process

def main():
    print("=" * 60)
    print("  EnterpriseHub Multi-Server Startup")
    print("=" * 60)
    print("\nStarting all MCP servers on separate endpoints...\n")
    
    processes = []
    
    for name, config in SERVERS.items():
        try:
            proc = start_server(name, config)
            processes.append((name, proc, config['port']))
            time.sleep(1)  # Stagger startup
        except Exception as e:
            print(f"❌ Failed to start {name}: {e}")
    
    print("\n" + "=" * 60)
    print("  All Servers Started!")
    print("=" * 60)
    print("\nEndpoints:")
    for name, proc, port in processes:
        print(f"  • {name:25} http://localhost:{port}/mcp")
    
    print("\n📝 Press Ctrl+C to stop all servers\n")
    
    try:
        # Wait for all processes
        for name, proc, port in processes:
            proc.wait()
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping all servers...")
        for name, proc, port in processes:
            proc.terminate()
        print("✅ All servers stopped")

if __name__ == "__main__":
    main()
