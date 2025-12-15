@echo off
:: Cleanup Script - Removes deprecated server launch scripts
:: Run this after verifying start_dev.bat and start_single.bat work correctly

echo ========================================
echo   Cleanup Deprecated Server Scripts
echo ========================================
echo.
echo This will DELETE the following files:
echo   - start_agents_server.bat
echo   - start_agents_server_fixed.bat
echo   - start_main_server.bat
echo   - start_composite_server.bat
echo   - start_mcp_server_fixed.bat
echo   - start_all_servers.bat
echo   - start_all_servers.py
echo.
echo These have been replaced by:
echo   - start_dev.bat (all servers)
echo   - start_single.bat (individual servers)
echo.
set /p confirm="Are you sure you want to delete these files? (y/N): "

if /i not "%confirm%"=="y" (
    echo.
    echo Cleanup cancelled.
    pause
    exit /b 0
)

echo.
echo Deleting deprecated scripts...

if exist "start_agents_server.bat" (
    del "start_agents_server.bat"
    echo   ✓ Deleted start_agents_server.bat
)

if exist "start_agents_server_fixed.bat" (
    del "start_agents_server_fixed.bat"
    echo   ✓ Deleted start_agents_server_fixed.bat
)

if exist "start_main_server.bat" (
    del "start_main_server.bat"
    echo   ✓ Deleted start_main_server.bat
)

if exist "start_composite_server.bat" (
    del "start_composite_server.bat"
    echo   ✓ Deleted start_composite_server.bat
)

if exist "start_mcp_server_fixed.bat" (
    del "start_mcp_server_fixed.bat"
    echo   ✓ Deleted start_mcp_server_fixed.bat
)

if exist "start_all_servers.bat" (
    del "start_all_servers.bat"
    echo   ✓ Deleted start_all_servers.bat
)

if exist "start_all_servers.py" (
    del "start_all_servers.py"
    echo   ✓ Deleted start_all_servers.py
)

echo.
echo ========================================
echo   Cleanup Complete!
echo ========================================
echo.
echo You now have 2 optimized scripts:
echo   1. start_dev.bat    - Start all servers
echo   2. start_single.bat - Start individual server
echo.
echo See README_SERVERS.md for usage guide
echo.
pause
