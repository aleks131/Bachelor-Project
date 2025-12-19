@echo off
setlocal
echo ===================================================
echo     SMART SOLUTIONS - COMPLETE FIX & START
echo ===================================================
echo.

echo [1/5] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    ✓ Processes stopped

echo.
echo [2/5] Clearing browser cache reminder...
echo    NOTE: If browser shows old content, press CTRL+SHIFT+DELETE
echo          to clear cache, or use CTRL+F5 to hard refresh
echo.

echo [3/5] Verifying files...
if not exist "data\users.json" (
    echo    Creating users.json...
    call node backend\init-admin.js
)
if not exist "data\config.json" (
    echo    Creating config.json...
    echo {} > "data\config.json"
)
echo    ✓ Files verified

echo.
echo [4/5] Starting server...
echo    Server starting in new window...
echo    Wait 5 seconds for server to initialize...
echo.
start cmd /k "cd /d %~dp0 && node backend/server.js"
timeout /t 5 /nobreak >nul

echo [5/5] Opening browser...
start http://localhost:3000
echo.

echo ===================================================
echo     SERVER STARTED
echo ===================================================
echo.
echo Default Login:
echo    Username: admin
echo    Password: admin123
echo.
echo If you see a blank page or old content:
echo    1. Press CTRL + F5 (hard refresh)
echo    2. Or clear browser cache (CTRL + SHIFT + DELETE)
echo    3. Or try incognito/private mode
echo.
echo Server is running in the background window.
echo Close that window to stop the server.
echo.
pause

