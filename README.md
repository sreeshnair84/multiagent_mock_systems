# Enterprise Hub Enterprise

Enterprise Hub Enterprise is an AI-powered IT management dashboard that unifies ServiceNow, Microsoft 365, Intune, and SAP GRC into a single glass-pane interface.

![Enterprise Hub Interface](https://via.placeholder.com/800x400?text=Enterprise Hub+Enterprise+Dashboard)

## 🚀 Features

- **Unified Dashboard**: View tickets, devices, users, and access requests in one place.
- **AI Agent Streams**: Interact with "Intune Copilot" and "Access Assistant" via a Gemini-style chat interface using Voice or Text.
- **Smart Workflows**: 
  - Automated Risk Calculation for Access Requests.
  - One-click Device Compliance Checks.
  - License Assignment & User Onboarding.
- **Modern UI**: Built with a premium "Enterprise Hub" glassmorphism design system.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite.
- **Backend**: FastAPI, LangGraph, Python.
- **AI**: LangChain, Model Context Protocol (MCP).

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js & pnpm
- Python 3.10+

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Start All Servers (Agents + MCP + LLM Integration)
./start_all_servers.bat
```

> **Note**: This starts:
> - **Agents Server**: Port 8006 (FastAPI + LangGraph)
> - **MCP Composite Server**: Port 8002 (FastMCP)

### 2. Frontend Setup
```bash
cd frontend
pnpm install
pnpm run dev
```

Visit `http://localhost:5173` to access the application.

## 🤖 Agent Workflows

The system features intelligent **AI Agents** that use the Model Context Protocol (MCP) to access tools:
- **Intune Agent**: Device enrollment, profile management, and compliance checks (RAG-enabled).
- **VM Agent**: Azure VM provisioning and resource management.
- **Access Agent**: Application access requests and risk assessment.

Select your workflow in the **Agent Streams** page to begin.

## 📝 Documentation
See [PROJECT_SPEC.md](./PROJECT_SPEC.md) for detailed architecture and specifications.
