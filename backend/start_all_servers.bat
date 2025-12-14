@echo off
REM Start all MCP servers on different endpoints
REM Each server gets its own port

echo ========================================
echo   EnterpriseHub Multi-Server Startup
echo ========================================
echo.
echo Activating virtual environment...
cd /d %~dp0
call venv\Scripts\activate.bat

echo.
echo Starting all servers on separate endpoints...
echo.

python start_all_servers.py

pause
