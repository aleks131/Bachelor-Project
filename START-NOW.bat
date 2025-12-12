@echo off
title Smart Solutions - Start Now
color 0A
cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Smart Solutions by TripleA - Quick Start          ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [1] Stopping any existing servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    [OK] Cleaned up
echo.

echo [2] Starting server...
echo.
echo ════════════════════════════════════════════════════════
echo   Server starting on http://localhost:3000
echo   Login: admin / admin123
echo ════════════════════════════════════════════════════════
echo.
echo   Keep this window open!
echo   Press Ctrl+C to stop the server
echo.

start "Smart Solutions Server" cmd /k "node backend/server.js"

timeout /t 6 /nobreak >nul

echo [3] Opening browser...
start http://localhost:3000

echo.
echo ✅ Server started!
echo ✅ Browser opened!
echo.
echo    If you see errors, check the server window
echo    The server window is open separately
echo.
pause

