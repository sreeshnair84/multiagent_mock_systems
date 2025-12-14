@echo off
REM Test MCP Servers with Inspector
REM Run from backend directory

echo ========================================
echo   MCP Inspector Testing
echo ========================================
echo.
echo Choose a server to test:
echo.
echo 1. Composite Server (RECOMMENDED - All Tools)
echo 2. Individual Server - ServiceNow
echo 3. Individual Server - Intune
echo 4. Individual Server - M365
echo 5. Individual Server - Access Management
echo 6. Individual Server - Outlook
echo 7. Individual Server - Workflow
echo.

set /p choice="Enter choice (1-7): "

if "%choice%"=="1" (
    echo.
    echo Starting Composite MCP Server with Inspector...
    echo This includes all tools from all servers.
    echo.
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/composite_server.py
)
if "%choice%"=="2" (
    echo.
    echo Starting ServiceNow MCP Server with Inspector...
    echo.
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/servers/servicenow_mcp.py
)
if "%choice%"=="3" (
    echo.
    echo Starting Intune MCP Server with Inspector...
    echo.
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/servers/intune_mcp.py
)
if "%choice%"=="4" (
    echo.
    echo Starting M365 MCP Server with Inspector...
    echo.
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/servers/m365_mcp.py
)
if "%choice%"=="5" (
    echo.
    echo Starting Access Management MCP Server with Inspector...
    echo.
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/servers/access_mcp.py
)
if "%choice%"=="6" (
    echo.
    echo Starting Outlook MCP Server with Inspector...
    echo.
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/servers/outlook_mcp.py
)
if "%choice%"=="7" (
    echo.
    echo Starting Workflow MCP Server with Inspector...
    echo.
    cd ..
    npx @modelcontextprotocol/inspector python backend/app/mcp/servers/workflow_mcp.py
)

pause
