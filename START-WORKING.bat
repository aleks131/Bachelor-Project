@echo off
title Smart Solutions - WORKING Server Start
color 0A
cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Smart Solutions by TripleA - Starting Server      ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [1] Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo    ✅ Cleaned up
echo.

echo [2] Starting server...
echo.
echo ════════════════════════════════════════════════════════
echo   Server starting in new window...
echo   Look for: "Smart Solutions by TripleA running"
echo ════════════════════════════════════════════════════════
echo.

start "Smart Solutions Server" cmd /k "node backend/server.js"

timeout /t 8 /nobreak >nul

echo [3] Checking server status...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    echo    ✅✅✅ SERVER IS RUNNING! ✅✅✅
    echo.
    echo [4] Opening browser...
    start http://localhost:3000
    timeout /t 2 /nobreak >nul
    echo    ✅ Browser opened
    echo.
    echo ╔════════════════════════════════════════════════════════╗
    echo ║                                                       ║
    echo ║   ✅ SERVER IS WORKING!                              ║
    echo ║                                                       ║
    echo ╚════════════════════════════════════════════════════════╝
    echo.
    echo   URL: http://localhost:3000
    echo   Login: admin / admin123
    echo.
    echo   The server window is open - keep it open!
    echo   If you see errors in that window, let me know
    echo.
) else (
    echo    ❌ Server did not start
    echo.
    echo   Please check the server window for errors
    echo   The window should show what went wrong
    echo.
)

pause

