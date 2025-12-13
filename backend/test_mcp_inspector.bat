@echo off
REM Test MCP Servers with Inspector
REM Run from backend directory

echo Testing MCP Servers with Inspector
echo ===================================
echo.
echo Choose a server to test:
echo 1. ServiceNow (port 8001)
echo 2. Intune (port 8002)
echo 3. M365 User Management (port 8004)
echo 4. Access Management (port 8005)
echo 5. Outlook (port 8006)
echo 6. Workflow (port 8007)
echo.

set /p choice="Enter choice (1-6): "

if "%choice%"=="1" (
    echo Starting ServiceNow MCP Inspector...
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/servers/servicenow_mcp.py
)
if "%choice%"=="2" (
    echo Starting Intune MCP Inspector...
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/servers/intune_mcp.py
)
if "%choice%"=="3" (
    echo Starting M365 MCP Inspector...
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/servers/m365_mcp.py
)
if "%choice%"=="4" (
    echo Starting Access Management MCP Inspector...
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/servers/access_mcp.py
)
if "%choice%"=="5" (
    echo Starting Outlook MCP Inspector...
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/servers/outlook_mcp.py
)
if "%choice%"=="6" (
    echo Starting Workflow MCP Inspector...
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/servers/workflow_mcp.py
)

pause
