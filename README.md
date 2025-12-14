# Nexus Enterprise

Nexus Enterprise is an AI-powered IT management dashboard that unifies ServiceNow, Microsoft 365, Intune, and SAP GRC into a single glass-pane interface.

![Nexus Interface](https://via.placeholder.com/800x400?text=Nexus+Enterprise+Dashboard)

## 🚀 Features

- **Unified Dashboard**: View tickets, devices, users, and access requests in one place.
- **AI Agent Streams**: Interact with "Intune Copilot" and "Access Assistant" via a Gemini-style chat interface using Voice or Text.
- **Smart Workflows**: 
  - Automated Risk Calculation for Access Requests.
  - One-click Device Compliance Checks.
  - License Assignment & User Onboarding.
- **Modern UI**: Built with a premium "InfyMe" glassmorphism design system.

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
./start_composite_server.bat
```

### 2. Frontend Setup
```bash
cd frontend
pnpm install
pnpm run dev
```

Visit `http://localhost:5173` to access the application.

## 🤖 Agent Workflows

The system features a **Supervisor Agent** that routes requests to specialized sub-agents:
- **ServiceNow Agent**: For ticketing.
- **Intune Agent**: For device management.
- **M365 Agent**: For user/license management.
- **Access Agent**: For approvals and risk assessment.

Select your workflow in the **Agent Streams** page to begin.

## 📝 Documentation
See [PROJECT_SPEC.md](./PROJECT_SPEC.md) for detailed architecture and specifications.
