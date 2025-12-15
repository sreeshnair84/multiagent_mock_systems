# Enterprise Hub Enterprise - Project Specification

## 1. Executive Summary
Enterprise Hub Enterprise is a modern, agentic IT management portal designed to unify disparate enterprise systems (ServiceNow, M365, Intune, SAP GRC) into a single, cohesive interface. It leverages AI agents to perform complex workflows, such as device compliance checks, access requests, and user onboarding, while providing a premium, glassmorphism-style user experience.

## 2. Core Architecture
- **Frontend**: React (Vite) + TypeScript + Tailwind CSS.
  - **Design System**: "Enterprise Hub Purple" theme, glassmorphism, responsive dashboard.
  - **Key Pages**: Dashboard, Tickets, Access Requests, Users, Devices, Emails, Agent Streams.
- **Backend**: FastAPI + Python.
  - **Agent Framework**: LangGraph + LangChain.
  - **Modules**:
    - `api/`: REST endpoints for entity CRUD.
    - `agents/`: AI agent logic (Supervisor, Intune, ServiceNow, etc.).
    - `mcp/`: Model Context Protocol servers for tool exposure.
  - **Database**: SQLModel (SQLite/PostgreSQL).
  - **Communication**: WebSocket for real-time agent interaction.

## 3. Key Features

### 3.1 Authentication
- JWT-based authentication.
- Role-based access control (Admin, User, Manager).
- Secure, token-based session management.

### 3.2 Unified Entity Management (CRUD)
- **ServiceNow Tickets**: Create, View (Activity Log), Edit, Assign.
- **Access Requests**: Request access (SAP), Risk Calculation (AI), Approval Workflows.
- **User Management**: M365 Users, License Assignment, Onboarding.
- **Device Management**: Intune Devices, Compliance Checks, Wipe Actions.
- **Emails**: Inbox View, Read/Unread status, Reply/Compose.

### 3.3 Agentic Workflows ("Gemini" Interface)
- **Interface**: Centered, chat-based UI with voice input/output.
- **Workflows**:
  1.  **Intune Copilot**: Specialized for device diagnostics, compliance, and troubleshooting.
  2.  **Application Access**: Streamlined flow for requesting permissions and approvals.
- **Features**:
  - Real-time tool call visualization ("Thinking..." expanders).
  - Voice interaction (Speech-to-Text / Text-to-Speech).
  - Context-aware routing via Supervisor agent.

### 3.4 Design & UX
- **Theme**: Premium styling with gradients, blurs, and consistent spacing.
- **Modals**: Detailed "View" modals for all entities to prevent context switching.
- **Responsiveness**: Fully adaptive layout for Desktop and Mobile.

## 4. Technical Specifications

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS + Custom CSS Variables (`design-system.css`)
- **State**: React Context (Auth) + Local State

### Backend
- **Framework**: FastAPI
- **AI Orchestration**: LangGraph
- **Protocol**: MCP (Model Context Protocol)
- **Real-time**: WebSockets (`/ws/chat/{client_id}`)

## 5. Development Setup
1.  **Frontend**: `pnpm install` -> `pnpm run dev`
2.  **Backend**: `pip install -r requirements.txt` -> `bat start_composite_server.bat`

## 6. Future Roadmap
- Integration with live SAP instances.
- Enhanced voice capabilities (voice-interruption).
- Mobile native application.
