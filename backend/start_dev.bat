@echo off
:: Unified Development Server Launcher
:: Starts all required servers for the Antigravity platform

set PYTHONPATH=%~dp0
cd /d %~dp0

echo ========================================
echo   Antigravity Development Servers
echo ========================================
echo.
echo Starting 3 servers:
echo   [1] Main API Server      (port 8000)
echo   [2] A2A Agents Server    (port 8006)
echo   [3] MCP Composite Server (port 8001)
echo.
echo ========================================
echo.

:: Start MCP Composite Server (Must be first)
start "MCP Composite (8001)" cmd /k "set PYTHONPATH=%~dp0 && cd /d %~dp0 && set MCP_COMPOSITE_PORT=8001 && echo [MCP Composite] Starting on port 8001... && python app/mcp/composite_server.py"

:: Wait for MCP to fully initialize
timeout /t 5 /nobreak >nul

:: Start A2A Agents Server (Depends on MCP)
start "A2A Agents (8006)" cmd /k "set PYTHONPATH=%~dp0 && cd /d %~dp0 && echo [A2A Agents] Starting on port 8006... && python -m app.agents.server"

:: Wait for Agents
timeout /t 5 /nobreak >nul

:: Start Main API Server (Depends on Graph/Agents/MCP)
start "Main API (8000)" cmd /k "set PYTHONPATH=%~dp0 && cd /d %~dp0 && echo [Main API] Starting on port 8000... && python main.py"

echo.
echo ========================================
echo   All servers started in separate windows!
echo ========================================
echo.
echo Endpoints:
echo   Main API:       http://localhost:8000
echo   A2A Agents:     http://localhost:8006
echo   MCP Composite:  http://localhost:8001
echo.
echo Close individual windows to stop servers
echo ========================================
echo.
pause
