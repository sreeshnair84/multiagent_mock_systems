# Testing MCP Servers with MCP Inspector

## What is MCP Inspector?

MCP Inspector is an official debugging tool for MCP servers that provides:
- Interactive testing of MCP tools
- Real-time server communication monitoring
- Tool parameter validation
- Response inspection

## Installation

The MCP Inspector is available via npx (no installation needed).

## Quick Start - Composite Server (Recommended)

### Option 1: HTTP Transport (For Web Clients & MCP Inspector)

Start the server with HTTP transport and CORS enabled:

```bash
cd backend
start_composite_server.bat
```

Or manually:

```bash
cd c:\Users\Srees\project\antigravity
set MCP_TRANSPORT=http
python backend/app/mcp/composite_server.py
```

The server will start on `http://localhost:8000` with:
- Streamable HTTP transport
- CORS enabled for all origins
- All tools from all sub-servers available

You can then test with MCP Inspector by connecting to the HTTP endpoint, or use it directly from web clients.

### Option 2: STDIO Transport (For Direct MCP Inspector Testing)

For direct stdio testing with MCP Inspector:

```bash
cd c:\Users\Srees\project\antigravity
set MCP_TRANSPORT=stdio
npx @modelcontextprotocol/inspector python backend/app/mcp/composite_server.py
```

Or use the batch script:

```bash
cd backend
test_mcp_inspector.bat
# Choose option 1 for Composite Server
```

## Architecture

Our MCP implementation uses **FastMCP composition** with the `mount()` pattern:

- **Composite Server**: `app/mcp/composite_server.py` - Main entry point
- **Sub-servers**: Individual servers in `app/mcp/servers/`
  - `servicenow_mcp.py` - ServiceNow ticket management
  - `intune_mcp.py` - Device management
  - `m365_mcp.py` - User management
  - `access_mcp.py` - Access control workflows
  - `outlook_mcp.py` - Email operations
  - `workflow_mcp.py` - Workflow management

All sub-servers are **mounted** into the composite server with prefixes for organization.

## Available Tools

### ServiceNow Tools (prefix: servicenow_)
- `servicenow_create_servicenow_ticket` - Create a new ticket
- `servicenow_search_servicenow_tickets` - Search for tickets
- `servicenow_get_servicenow_ticket` - Get ticket by ID
- `servicenow_update_servicenow_ticket_status` - Update ticket status
- `servicenow_add_servicenow_work_note` - Add work note
- `servicenow_update_servicenow_ticket_tags` - Update tags
- `servicenow_escalate_servicenow_ticket` - Escalate ticket

### Intune Tools (prefix: intune_)
- `intune_provision_intune_device` - Provision a device
- `intune_list_intune_devices` - List devices
- `intune_get_intune_device_profile` - Get device profile
- `intune_update_intune_device_status` - Update device status
- `intune_wipe_intune_device` - Wipe device (requires confirmation)

### M365 Tools (prefix: m365_)
- `m365_list_m365_users` - List users
- `m365_get_m365_user_roles` - Get user roles
- `m365_create_m365_user` - Create user
- `m365_deactivate_m365_user` - Deactivate user
- `m365_generate_m365_token` - Generate JWT token

### Access Management Tools (prefix: access_)
- `access_submit_access_management_request` - Submit access request
- `access_get_access_workflow_status` - Check request status
- `access_approve_access_request` - Approve/reject request
- `access_notify_access_approver` - Send notification
- `access_onboard_new_user` - Full onboarding workflow

### Outlook Tools (prefix: outlook_)
- `outlook_get_outlook_emails` - Get emails
- `outlook_send_outlook_email` - Send email
- `outlook_mark_outlook_email_read` - Mark as read
- `outlook_extract_outlook_approval` - Extract approval

### Workflow Tools (prefix: workflow_)
- `workflow_replay_workflow_from_checkpoint` - Replay workflow
- `workflow_terminate_workflow_execution` - Terminate workflow
- `workflow_resume_interrupted_workflow` - Resume workflow

## Testing Individual Servers (Optional)

You can also test individual servers if needed:

```bash
# Test ServiceNow only
npx @modelcontextprotocol/inspector python backend/app/mcp/servers/servicenow_mcp.py

# Test Intune only
npx @modelcontextprotocol/inspector python backend/app/mcp/servers/intune_mcp.py

# Test M365 only
npx @modelcontextprotocol/inspector python backend/app/mcp/servers/m365_mcp.py

# Test Access Management only
npx @modelcontextprotocol/inspector python backend/app/mcp/servers/access_mcp.py

# Test Outlook only
npx @modelcontextprotocol/inspector python backend/app/mcp/servers/outlook_mcp.py

# Test Workflow only
npx @modelcontextprotocol/inspector python backend/app/mcp/servers/workflow_mcp.py
```

## Using MCP Inspector UI

When you run the inspector, it will:

1. **Open a web browser** with an interactive UI
2. **Show all available tools** from the server
3. **Let you test tools** by filling in parameters
4. **Display responses** in real-time
5. **Show server logs** for debugging

## Example Test Flow

### Testing the Composite Server

1. Start Inspector:
   ```bash
   cd c:\Users\Srees\project\antigravity
   npx @modelcontextprotocol/inspector python backend/app/mcp/composite_server.py
   ```

2. In the browser UI:
   - You'll see all tools from all servers
   - Tools are prefixed by their server name (e.g., `servicenow_`, `intune_`)
   - Click on any tool to test it

3. Test creating a ServiceNow ticket:
   - Click on `servicenow_create_servicenow_ticket`
   - Fill in:
     - title: "Test Ticket"
     - description: "Testing composite MCP server"
     - priority: "High"
   - Click "Run Tool"
   - Verify ticket is created

4. Test searching tickets:
   - Click on `servicenow_search_servicenow_tickets`
   - Leave parameters empty (will return all tickets)
   - Click "Run Tool"
   - See the response with ticket data

## Troubleshooting

If inspector doesn't work:

1. **Check Python path**: Make sure `python` command works
2. **Check server file**: Ensure the composite_server.py file exists
3. **Check dependencies**: Run `pip install fastmcp` in the backend directory
4. **Check imports**: Make sure all sub-servers can be imported

## Next Steps

After testing with Inspector:
1. Verify all tools work correctly
2. Test error handling (invalid parameters)
3. Check database updates (tickets, devices, users created)
4. Integrate with your agents using the composite server

