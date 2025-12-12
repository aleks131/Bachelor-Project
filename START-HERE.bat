@echo off
title Smart Solutions - START HERE
color 0A
cd /d "%~dp0"

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║   Smart Solutions by TripleA                        ║
echo ║   Version 2.0.0                                      ║
echo ║                                                       ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [STEP 1] Stopping any existing servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    Done!
echo.

echo [STEP 2] Starting server...
echo.
echo    Server window will open separately
echo    Wait for: "Smart Solutions by TripleA running"
echo.

start "Smart Solutions Server" cmd /k "node backend/server.js"

echo    Waiting for server to start...
timeout /t 10 /nobreak >nul

echo.
echo [STEP 3] Checking server...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Server is RUNNING!
    echo.
    echo [STEP 4] Opening browser...
    start http://localhost:3000
    timeout /t 2 /nobreak >nul
    echo    ✅ Browser opened!
    echo.
    echo ╔════════════════════════════════════════════════════════╗
    echo ║                                                       ║
    echo ║   ✅ SUCCESS!                                         ║
    echo ║                                                       ║
    echo ║   URL: http://localhost:3000                        ║
    echo ║   Login: admin / admin123                            ║
    echo ║                                                       ║
    echo ║   Keep the server window open!                      ║
    echo ║                                                       ║
    echo ╚════════════════════════════════════════════════════════╝
    echo.
) else (
    echo    ⚠️  Server may still be starting...
    echo    Check the server window for messages
    echo    Opening browser anyway...
    start http://localhost:3000
    echo.
    echo    If browser shows error, wait 10 seconds and refresh
    echo.
)

pause

