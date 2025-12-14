# EnterpriseHub Multi-Endpoint Configuration

## Overview

EnterpriseHub now supports running all MCP servers on **separate endpoints** simultaneously. This gives you flexibility to access either:
- **Composite endpoint** - All tools unified at one endpoint
- **Individual endpoints** - Each domain on its own endpoint

## Endpoint Configuration

| Server | Port | Endpoint | Description |
|--------|------|----------|-------------|
| **EnterpriseHub** (Composite) | 8000 | `http://localhost:8000/mcp` | All tools unified |
| ServiceNow | 8001 | `http://localhost:8001/mcp` | Ticket management |
| Intune | 8002 | `http://localhost:8002/mcp` | Device management |
| M365 | 8003 | `http://localhost:8003/mcp` | User management |
| Access Management | 8004 | `http://localhost:8004/mcp` | Access control |
| Outlook | 8005 | `http://localhost:8005/mcp` | Email operations |
| Workflow | 8006 | `http://localhost:8006/mcp` | Workflow orchestration |

## Usage Options

### Option 1: Start All Servers (Recommended for Development)

Start all servers on different ports simultaneously:

```bash
cd backend
start_all_servers.bat
```

This will start:
- Composite server on port 8000
- All individual servers on ports 8001-8006

**Benefits:**
- Access any server independently
- Test individual domains in isolation
- Use composite for unified access
- All servers have CORS enabled

### Option 2: Start Only Composite Server

Start just the unified composite server:

```bash
cd backend
start_composite_server.bat
```

This starts only the composite server on port 8000 with all tools accessible via prefixes.

### Option 3: Start Individual Server

Start a specific server on a custom port:

```bash
cd backend
call venv\Scripts\activate.bat
set MCP_TRANSPORT=http
set MCP_SERVER_PORT=8001
python app/mcp/servers/servicenow_mcp.py
```

## When to Use Each Endpoint

### Use Composite Endpoint (Port 8000)
- **Agent integration** - Single endpoint for all operations
- **Client demos** - Show unified platform capabilities
- **Production** - Simplified deployment and management

### Use Individual Endpoints (Ports 8001-8006)
- **Development** - Test specific domain in isolation
- **Debugging** - Isolate issues to specific server
- **Microservices** - Deploy domains independently
- **Load balancing** - Distribute traffic across services

## Testing with MCP Inspector

### Test Composite Server
```bash
# Option 1: HTTP endpoint
# Start server with start_composite_server.bat, then connect to http://localhost:8000/mcp

# Option 2: STDIO
set MCP_TRANSPORT=stdio
npx @modelcontextprotocol/inspector python app/mcp/composite_server.py
```

### Test Individual Server
```bash
# Example: Test ServiceNow server
set MCP_TRANSPORT=stdio
npx @modelcontextprotocol/inspector python app/mcp/servers/servicenow_mcp.py
```

## Architecture Benefits

### Flexibility
- Choose between unified or isolated access
- Easy to switch deployment models
- Support both monolithic and microservices patterns

### Scalability
- Scale individual services independently
- Load balance specific high-traffic domains
- Deploy only needed services

### Development
- Test domains in isolation
- Debug without affecting other services
- Parallel development on different domains

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_TRANSPORT` | `http` | Transport mode: `http` or `stdio` |
| `MCP_COMPOSITE_PORT` | `8000` | Port for composite server |
| `MCP_SERVER_PORT` | (varies) | Override port for individual server |

## Example: Custom Port Configuration

```bash
# Start ServiceNow on custom port 9001
set MCP_TRANSPORT=http
set MCP_SERVER_PORT=9001
python app/mcp/servers/servicenow_mcp.py
```

## CORS Configuration

All servers (composite and individual) have CORS enabled for:
- All origins (`*`)
- All methods
- All headers
- Credentials support

This allows web clients to connect from any domain.
