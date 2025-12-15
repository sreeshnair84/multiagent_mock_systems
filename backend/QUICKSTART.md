# Backend - Quick Start Guide

## 🏗️ Architecture
The backend runs on two primary servers:
1.  **Agents Server (Port 8006)**: Serves the AI Agents (Intune, VM, Access) via A2A Protocol.
2.  **MCP Composite Server (Port 8002)**: Hosts all tools (ServiceNow, Intune SDK, M365) via Model Context Protocol.

## 🚀 Startup
To start both servers simultaneously:

```bash
cd backend
# Windows
./start_all_servers.bat
```

## 🧪 Verification & Testing
Scripts have been consolidated in `backend/scripts/`.

### 1. Verify Frontend <-> Backend Streaming
Tests if the A2A streaming endpoint is reachable and returning events.
```bash
python scripts/verify_frontend_flow.py
```

### 2. Verify RAG (Intune SOP)
Tests if the Intune Agent can retrieve knowledge from the SOP.
```bash
python scripts/verify_rag.py
```

### 3. Verify Model Access
Checks if the configured LLM (Gemini) is reachable.
```bash
python scripts/list_models_http.py
```

### 4. Check Environment
Validates API keys and `.env` settings.
```bash
python scripts/check_env.py
```

## 📝 Key Folders
- **`app/agents/`**: LangGraph agent logic and `server.py` (FastAPI app).
- **`app/mcp/`**: FastMCP servers and tool definitions.
- **`app/tools/`**: Custom tools (RAG, Memory).
- **`scripts/`**: Verification and utility scripts.
- **`docs/`**: SOPs and knowledge base files.
