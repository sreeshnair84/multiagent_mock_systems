@echo off
:: Single Server Launcher - for debugging individual servers
:: Usage: start_single.bat [main|agents|mcp]

set PYTHONPATH=%~dp0
cd /d %~dp0

if "%1"=="" goto menu
if /i "%1"=="main" goto main
if /i "%1"=="agents" goto agents
if /i "%1"=="mcp" goto mcp
goto menu

:menu
echo ========================================
echo   Start Individual Server
echo ========================================
echo.
echo Select server to start:
echo   [1] Main API Server      (port 8000)
echo   [2] A2A Agents Server    (port 8006)
echo   [3] MCP Composite Server (port 8001)
echo.
echo Usage: start_single.bat [main^|agents^|mcp]
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" goto main
if "%choice%"=="2" goto agents
if "%choice%"=="3" goto mcp
echo Invalid choice!
pause
exit /b 1

:main
echo.
echo Starting Main API Server on port 8000...
echo.
python main.py
pause
exit /b 0

:agents
echo.
echo Starting A2A Agents Server on port 8006...
echo.
python -m app.agents.server
pause
exit /b 0

:mcp
echo.
echo Starting MCP Composite Server on port 8001...
echo.
set MCP_COMPOSITE_PORT=8001
python app/mcp/composite_server.py
pause
exit /b 0
