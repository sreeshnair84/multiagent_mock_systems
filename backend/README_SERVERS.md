# Server Management Guide

## Quick Start

### Development Mode (All Servers)
```bash
.\start_dev.bat
```
This starts all 3 required servers in separate windows:
- **Main API** (port 8000) - REST API, WebSocket chat, database
- **A2A Agents** (port 8006) - LangGraph agents with A2A protocol
- **MCP Composite** (port 8001) - Model Context Protocol tools

### Single Server Mode (Debugging)
```bash
# Interactive menu
.\start_single.bat

# Direct launch
.\start_single.bat main      # Main API only
.\start_single.bat agents    # A2A Agents only
.\start_single.bat mcp       # MCP Composite only
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│                    http://localhost:5173                    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ REST/WS                      │ A2A Protocol
               ▼                              ▼
┌──────────────────────────┐    ┌────────────────────────────┐
│   Main API Server        │    │   A2A Agents Server        │
│   Port: 8000             │    │   Port: 8006               │
│                          │    │                            │
│ • REST APIs              │    │ • Resource Agent           │
│ • WebSocket Chat         │    │ • Intune Agent             │
│ • Database (SQLite)      │    │ • Access Management Agent  │
│ • LangGraph Supervisor   │    │                            │
└──────────┬───────────────┘    └────────────┬───────────────┘
           │                                 │
           │ MCP Protocol                    │ MCP Protocol
           └────────────┬────────────────────┘
                        ▼
           ┌────────────────────────┐
           │  MCP Composite Server  │
           │  Port: 8001            │
           │                        │
           │ • ServiceNow Tools     │
           │ • Intune Tools         │
           │ • M365 Tools           │
           │ • Access Tools         │
           │ • Outlook Tools        │
           │ • Workflow Tools       │
           └────────────────────────┘
```

## Server Details

### Main API Server (port 8000)
- **File**: `main.py`
- **Purpose**: Primary backend API
- **Features**:
  - REST endpoints for auth, users, onboarding, RBAC
  - WebSocket endpoint for chat (`/ws/chat/{client_id}`)
  - LangGraph supervisor for multi-agent orchestration
  - SQLite database for persistence
  - MCP router for listing available tools

### A2A Agents Server (port 8006)
- **File**: `app/agents/server.py`
- **Purpose**: Agent-to-Agent protocol server
- **Features**:
  - Resource Provisioning Agent (Azure resources)
  - Intune Management Agent (device management)
  - Access Management Agent (user access workflows)
  - A2A REST API for agent discovery and task execution

### MCP Composite Server (port 8001)
- **File**: `app/mcp/composite_server.py`
- **Purpose**: Unified tool server using Model Context Protocol
- **Features**:
  - Composite server mounting all domain-specific MCP servers
  - HTTP transport with CORS enabled
  - Tools for ServiceNow, Intune, M365, Access, Outlook, Workflows

## Deprecated Scripts

The following scripts have been **replaced** by `start_dev.bat` and `start_single.bat`:

| Old Script | Replaced By | Notes |
|------------|-------------|-------|
| `start_agents_server.bat` | `start_single.bat agents` | Used venv, logged to file |
| `start_agents_server_fixed.bat` | `start_single.bat agents` | Fixed PYTHONPATH version |
| `start_main_server.bat` | `start_single.bat main` | Simple main server launcher |
| `start_composite_server.bat` | `start_single.bat mcp` | Verbose MCP launcher |
| `start_mcp_server_fixed.bat` | `start_single.bat mcp` | Fixed MCP launcher |
| `start_all_servers.bat` | `start_dev.bat` | Used Python orchestrator |

**You can safely delete these old scripts** after verifying the new ones work.

## Environment Variables

All scripts automatically set:
- `PYTHONPATH=%~dp0` - Ensures Python can find app modules
- `MCP_COMPOSITE_PORT=8001` - MCP server port

## Troubleshooting

### Port Already in Use
If you get "address already in use" errors:
```bash
# Find process using port (PowerShell)
Get-NetTCPConnection -LocalPort 8000,8006,8001 | Select-Object LocalPort,OwningProcess

# Kill process
Stop-Process -Id <PID>
```

### Module Not Found
Ensure you're in the backend directory and PYTHONPATH is set:
```bash
cd c:\Users\Srees\project\antigravity\backend
set PYTHONPATH=%cd%
```

### Database Locked / Startup Crash
If SQLite is locked or Main API crashes on startup:
1. **Kill all Python processes**:
   ```powershell
   taskkill /F /IM python.exe
   ```
2. **Restart cleanly**:
   ```powershell
   .\start_dev.bat
   ```

**Important**: 
- **Start Order**: `start_dev.bat` enforces MCP (8001) -> Agents (8006) -> Main (8000). Do not change this order.
- **Auto-Reload Disabled**: To prevent infinite restart loops, `reload=False` is set in `main.py`. You must manually restart `start_single.bat main` if you change backend code.

## Development Workflow

1. **Start all servers**: `.\start_dev.bat`
2. **Make code changes** in your editor
3. **Restart affected server**: Close the specific server window and run `.\start_single.bat <server>`
4. **Test changes** via frontend
5. **Debug**: Check console output in individual windows.

## Production Deployment

For production, use proper process managers:
- **Windows**: NSSM (Non-Sucking Service Manager)
- **Linux**: systemd, supervisor, or PM2
- **Docker**: Multi-stage Dockerfile with separate services

Do not use these batch scripts in production!
