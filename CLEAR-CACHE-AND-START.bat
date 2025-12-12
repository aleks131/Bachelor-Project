@echo off
title Smart Solutions - Clear Cache & Start
color 0A
cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Smart Solutions - Clear Browser Cache & Start     ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [1] Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    ✅ Cleaned up
echo.

echo [2] Starting server...
start "Smart Solutions Server" cmd /k "node backend/server.js"
timeout /t 8 /nobreak >nul
echo    ✅ Server started
echo.

echo [3] Opening browser with cache cleared...
echo    IMPORTANT: Press Ctrl+Shift+Delete to clear browser cache
echo    Or use Ctrl+F5 to hard refresh
echo.

start http://localhost:3000

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║   ✅ SERVER IS RUNNING                                ║
echo ║                                                       ║
echo ║   URL: http://localhost:3000                          ║
echo ║   Login: admin / admin123                             ║
echo ║                                                       ║
echo ║   IF BROWSER SHOWS BLANK PAGE:                       ║
echo ║   1. Press Ctrl+Shift+Delete                           ║
echo ║   2. Clear cache and cookies                          ║
echo ║   3. Or press Ctrl+F5 to hard refresh                 ║
echo ║   4. Or try incognito/private window                  ║
echo ║                                                       ║
echo ╚════════════════════════════════════════════════════════╝
echo.

pause

