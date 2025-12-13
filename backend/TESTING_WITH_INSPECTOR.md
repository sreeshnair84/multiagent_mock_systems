# Quick Guide: Testing with MCP Inspector

## Current Status
MCP Inspector is already running! Check your browser - it should have opened automatically at `http://localhost:5173` or similar.

## Step-by-Step Testing

### 1. Open MCP Inspector
If the browser didn't open automatically:
- Look for the URL in the terminal output
- Usually opens at `http://localhost:5173` or `http://localhost:3000`

### 2. Test ServiceNow Server

**In the Inspector UI:**

1. **List Tools** - You should see 7 tools:
   - `create_servicenow_ticket`
   - `search_servicenow_tickets`
   - `get_servicenow_ticket`
   - `update_servicenow_ticket_status`
   - `add_servicenow_work_note`
   - `update_servicenow_ticket_tags`
   - `escalate_servicenow_ticket`

2. **Test Search** (easiest first test):
   - Click on `search_servicenow_tickets`
   - Leave all parameters empty
   - Click "Call Tool" or "Execute"
   - Should return list of existing tickets from seed data

3. **Test Create Ticket**:
   - Click on `create_servicenow_ticket`
   - Fill in:
     ```json
     {
       "title": "Test from MCP Inspector",
       "description": "Testing the MCP server",
       "priority": "High"
     }
     ```
   - Click "Call Tool"
   - Should return new ticket with ID like `INC0000004`

4. **Verify in Database**:
   - Run search again to see your new ticket

### 3. Test Other Servers

**To test different servers:**

1. **Stop current inspector** (Ctrl+C in terminal)

2. **Start inspector for another server**:
   ```bash
   # From project root (antigravity directory)
   npx @modelcontextprotocol/inspector python backend/app/mcp/servers/intune_mcp.py
   ```

3. **Test Intune tools**:
   - `list_intune_devices` - See existing devices
   - `provision_intune_device` - Create new device

4. **Test M365 tools**:
   ```bash
   npx @modelcontextprotocol/inspector python backend/app/mcp/servers/m365_mcp.py
   ```
   - `list_m365_users` - See all users
   - `get_m365_user_roles` - Check user roles

## Quick Test Commands

### Alternative: Test with curl (if Inspector has issues)

```bash
# Start a server manually
python backend/app/mcp/servers/servicenow_mcp.py

# In another terminal, test with curl
curl http://localhost:8001/mcp/v1/tools

# Call a tool
curl -X POST http://localhost:8001/mcp/v1/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "search_servicenow_tickets",
    "arguments": {}
  }'
```

## What to Look For

✅ **Success indicators:**
- Tools list appears in Inspector UI
- Tool calls return JSON responses
- No error messages
- Database updates (for create/update operations)

❌ **Common issues:**
- "Module not found" → Run from project root
- "Connection refused" → Server not started
- "Tool not found" → Check tool name spelling

## Example Test Flow

1. Start Inspector for ServiceNow
2. Search tickets (should see 3 from seed data)
3. Create new ticket
4. Search again (should see 4 tickets now)
5. Get specific ticket by ID
6. Update ticket status
7. Add work note

## Next Steps

After testing with Inspector:
1. Test all 6 servers
2. Verify database changes
3. Test agent integration
4. Run end-to-end workflows
