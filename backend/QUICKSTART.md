# Enterprise Integration - Quick Start Guide

## ✅ What's Complete

All core infrastructure is implemented and tested:

- **Database**: 5 models with seed data
- **Tools**: 30+ async functions (MCP-ready)
- **MCP Servers**: 6 servers on ports 8001-8007
- **API Endpoints**: Authentication, users, onboarding
- **RAG System**: 24 chunks from 5 SOPs in FAISS index

## 🚀 Quick Start

### 1. Start Main Backend (Port 8000)

```bash
cd c:\Users\Srees\project\antigravity\backend
python main.py
```

### 2. Start MCP Servers (Ports 8001-8007)

**Option A: Start All Servers**
```bash
python scripts/start_mcp_servers.py
```

**Option B: Start Individual Servers**
```bash
# ServiceNow (port 8001)
python app/mcp/servers/servicenow_mcp.py

# Intune (port 8002)
python app/mcp/servers/intune_mcp.py

# M365 User Management (port 8004)
python app/mcp/servers/m365_mcp.py

# Access Management (port 8005)
python app/mcp/servers/access_mcp.py

# Outlook (port 8006)
python app/mcp/servers/outlook_mcp.py

# Workflow (port 8007)
python app/mcp/servers/workflow_mcp.py
```

### 3. Test MCP Servers

```bash
# Test ServiceNow MCP
curl http://localhost:8001/
curl http://localhost:8001/tools

# Create a ticket via MCP
curl -X POST http://localhost:8001/invoke -H "Content-Type: application/json" -d "{\"tool_name\": \"create_ticket\", \"parameters\": {\"title\": \"Test\", \"description\": \"Testing MCP\", \"priority\": \"High\"}}"
```

## 📊 Test Credentials

- **Admin**: `admin@company.com` / `password123`
- **User 1**: `user1@company.com` / `password123`
- **User 2**: `user2@company.com` / `password123`
- **Pending**: `newuser@company.com` / `password123`

## 🔧 API Endpoints

### Authentication
```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "password123"}'

# Validate Token
curl -X GET http://localhost:8000/auth/validate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### User Management
```bash
# Create User (admin only)
curl -X POST http://localhost:8000/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@company.com", "username": "Test User", "password": "pass123", "role": "user"}'

# List Users
curl http://localhost:8000/users?status=Active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Onboarding
```bash
# Full Onboarding Workflow
curl -X POST http://localhost:8000/onboard \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "new@company.com", "username": "New User", "password": "pass123", "device_serial": "SN99999"}'
```

## 🧪 Testing

### Run Full Test Suite
```bash
python scripts/test_integration.py
```

### Test RAG System
```python
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = FAISS.load_local("./faiss_index", embeddings, allow_dangerous_deserialization=True)

# Query
results = vectorstore.similarity_search("How do I create a new M365 user?", k=3)
print(results[0].page_content)
```

## 📁 MCP Server Tools

### ServiceNow (Port 8001)
- `create_ticket` - Create new ticket
- `get_ticket` - Get ticket details
- `update_ticket_status` - Update status
- `add_work_note` - Add work note
- `update_ticket_tags` - Update tags
- `search_tickets` - Search tickets
- `escalate_ticket` - Escalate priority

### Intune (Port 8002)
- `provision_device` - Enroll device
- `get_device_profile` - Get configuration
- `update_device_status` - Update status
- `list_devices` - List devices
- `wipe_device` - Remote wipe (admin only)

### M365 User Management (Port 8004)
- `get_user_roles` - Get user roles
- `create_user` - Create new user
- `generate_token` - Generate JWT
- `list_users` - List users
- `deactivate_user` - Deactivate user

### Access Management (Port 8005)
- `submit_access_request` - Submit request
- `approve_request` - Approve/reject
- `get_workflow_status` - Check status
- `notify_approver` - Send notification
- `onboard_user` - Full onboarding

### Outlook (Port 8006)
- `send_email` - Send email
- `get_emails` - Get emails
- `mark_read` - Mark as read
- `extract_approval` - Extract approval

### Workflow (Port 8007)
- `replay_workflow` - Replay from checkpoint
- `terminate_workflow` - Force end
- `resume_interrupted` - Resume workflow

## 🔄 Next Steps

1. **Agent Integration**: Update agents to call MCP servers via HTTP
2. **End-to-End Testing**: Test complete workflows
3. **Frontend Integration**: Connect React frontend to backend APIs

## 📚 Documentation

- **Walkthrough**: `C:\Users\Srees\.gemini\antigravity\brain\ef6dfccd-e556-41de-a6d7-2666ea6b1461\walkthrough.md`
- **Task Tracking**: `C:\Users\Srees\.gemini\antigravity\brain\ef6dfccd-e556-41de-a6d7-2666ea6b1461\task.md`
- **SOPs**: `c:\Users\Srees\project\antigravity\backend\docs\`
