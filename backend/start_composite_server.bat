@echo off
REM Start EnterpriseHub Composite MCP Server with HTTP transport
REM This will start the server on http://localhost:8000 with CORS enabled

echo ========================================
echo   Starting EnterpriseHub MCP Server
echo ========================================
echo.
echo Activating virtual environment...
cd /d %~dp0
call venv\Scripts\activate.bat

echo.
echo Server will start on: http://localhost:8000
echo CORS: Enabled for all origins
echo Transport: Streamable HTTP
echo.
echo Press Ctrl+C to stop the server
echo.

set MCP_TRANSPORT=http
python app/mcp/composite_server.py

pause


