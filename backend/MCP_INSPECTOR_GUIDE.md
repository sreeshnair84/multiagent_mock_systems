# Testing MCP Servers with MCP Inspector

## What is MCP Inspector?

MCP Inspector is an official debugging tool for MCP servers that provides:
- Interactive testing of MCP tools
- Real-time server communication monitoring
- Tool parameter validation
- Response inspection

## Installation

The MCP Inspector is already available via npx (no installation needed).

## Testing Our Servers

### Option 1: Test Individual Server (Recommended)

Test each server one at a time:

```bash
# Test ServiceNow MCP Server (port 8001)
npx @modelcontextprotocol/inspector python app/mcp/servers/servicenow_mcp.py

# Test Intune MCP Server (port 8002)
npx @modelcontextprotocol/inspector python app/mcp/servers/intune_mcp.py

# Test M365 MCP Server (port 8004)
npx @modelcontextprotocol/inspector python app/mcp/servers/m365_mcp.py

# Test Access Management MCP Server (port 8005)
npx @modelcontextprotocol/inspector python app/mcp/servers/access_mcp.py

# Test Outlook MCP Server (port 8006)
npx @modelcontextprotocol/inspector python app/mcp/servers/outlook_mcp.py

# Test Workflow MCP Server (port 8007)
npx @modelcontextprotocol/inspector python app/mcp/servers/workflow_mcp.py
```

### Option 2: Test with HTTP Transport

Since our servers use `streamable-http`, you can also test them while they're running:

1. **Start a server:**
   ```bash
   python app/mcp/servers/servicenow_mcp.py
   ```

2. **In another terminal, use curl to test:**
   ```bash
   # List available tools
   curl http://localhost:8001/mcp/v1/tools
   
   # Call a tool
   curl -X POST http://localhost:8001/mcp/v1/tools/call \
     -H "Content-Type: application/json" \
     -d '{
       "name": "search_servicenow_tickets",
       "arguments": {}
     }'
   ```

## What to Test

### ServiceNow Server (port 8001)
- ✅ `create_servicenow_ticket` - Create a test ticket
- ✅ `search_servicenow_tickets` - Search for tickets
- ✅ `get_servicenow_ticket` - Get ticket by ID
- ✅ `update_servicenow_ticket_status` - Update ticket status
- ✅ `add_servicenow_work_note` - Add work note
- ✅ `update_servicenow_ticket_tags` - Update tags
- ✅ `escalate_servicenow_ticket` - Escalate ticket

### Intune Server (port 8002)
- ✅ `provision_intune_device` - Provision a device
- ✅ `list_intune_devices` - List devices
- ✅ `get_intune_device_profile` - Get device profile
- ✅ `update_intune_device_status` - Update device status
- ✅ `wipe_intune_device` - Wipe device (requires confirmation)

### M365 Server (port 8004)
- ✅ `list_m365_users` - List users
- ✅ `get_m365_user_roles` - Get user roles
- ✅ `create_m365_user` - Create user
- ✅ `deactivate_m365_user` - Deactivate user
- ✅ `generate_m365_token` - Generate JWT token

### Access Management Server (port 8005)
- ✅ `submit_access_management_request` - Submit access request
- ✅ `get_access_workflow_status` - Check request status
- ✅ `approve_access_request` - Approve/reject request
- ✅ `notify_access_approver` - Send notification
- ✅ `onboard_new_user` - Full onboarding workflow

### Outlook Server (port 8006)
- ✅ `get_outlook_emails` - Get emails
- ✅ `send_outlook_email` - Send email
- ✅ `mark_outlook_email_read` - Mark as read
- ✅ `extract_outlook_approval` - Extract approval

### Workflow Server (port 8007)
- ✅ `replay_workflow_from_checkpoint` - Replay workflow
- ✅ `terminate_workflow_execution` - Terminate workflow
- ✅ `resume_interrupted_workflow` - Resume workflow

## Using MCP Inspector UI

When you run the inspector, it will:

1. **Open a web browser** with an interactive UI
2. **Show all available tools** from the server
3. **Let you test tools** by filling in parameters
4. **Display responses** in real-time
5. **Show server logs** for debugging

## Example Test Flow

1. Start Inspector for ServiceNow:
   ```bash
   npx @modelcontextprotocol/inspector python app/mcp/servers/servicenow_mcp.py
   ```

2. In the browser UI:
   - Click on `search_servicenow_tickets`
   - Leave parameters empty (will return all tickets)
   - Click "Run Tool"
   - See the response with ticket data

3. Test creating a ticket:
   - Click on `create_servicenow_ticket`
   - Fill in:
     - title: "Test Ticket"
     - description: "Testing MCP server"
     - priority: "High"
   - Click "Run Tool"
   - Verify ticket is created

## Troubleshooting

If inspector doesn't work:

1. **Check Python path**: Make sure `python` command works
2. **Check server file**: Ensure the server file exists
3. **Check dependencies**: Run `pip install fastmcp`
4. **Check port availability**: Make sure ports 8001-8007 are free

## Next Steps

After testing with Inspector:
1. Verify all tools work correctly
2. Test error handling (invalid parameters)
3. Check database updates (tickets, devices, users created)
4. Test agent integration with these servers
