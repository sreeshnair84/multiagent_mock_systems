# 🚀 Quick Reference - Server Scripts

## Start All Servers (Development)
```bash
.\start_dev.bat
```
Opens 3 windows for Main API (8000), A2A Agents (8006), and MCP (8001)

## Start Single Server (Debugging)
```bash
.\start_single.bat          # Interactive menu
.\start_single.bat main     # Main API only
.\start_single.bat agents   # A2A Agents only
.\start_single.bat mcp      # MCP Composite only
```

## Cleanup Old Scripts
```bash
.\cleanup_old_scripts.bat   # Remove deprecated scripts (with confirmation)
```

## Server Endpoints
| Server | Port | URL |
|--------|------|-----|
| Main API | 8000 | http://localhost:8000 |
| A2A Agents | 8006 | http://localhost:8006 |
| MCP Composite | 8001 | http://localhost:8001 |

## What Changed?
**Before**: 6 different scripts (confusing, redundant)
- start_agents_server.bat
- start_agents_server_fixed.bat
- start_main_server.bat
- start_composite_server.bat
- start_mcp_server_fixed.bat
- start_all_servers.bat + .py

**After**: 2 optimized scripts (clear, simple)
- ✅ start_dev.bat (all servers)
- ✅ start_single.bat (one server)

## Migration Steps
1. ✅ Test new scripts: `.\start_dev.bat`
2. ✅ Verify all servers start correctly
3. ✅ Run cleanup: `.\cleanup_old_scripts.bat`
4. ✅ Read full docs: `README_SERVERS.md`

---
📖 Full documentation: [README_SERVERS.md](README_SERVERS.md)
