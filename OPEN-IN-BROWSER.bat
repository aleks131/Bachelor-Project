@echo off
title Smart Solutions by TripleA - Open Browser
cd /d "%~dp0"

echo.
echo ========================================
echo   Smart Solutions by TripleA
echo   Opening Browser...
echo ========================================
echo.

REM Check if server is running
netstat -an | find "3000" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Server may not be running on port 3000
    echo.
    echo Starting server first...
    echo.
    start "Smart Solutions Server" cmd /k "node backend/server.js"
    echo Waiting for server to start...
    timeout /t 5 /nobreak >nul
)

REM Try multiple browser methods
echo Opening http://localhost:3000...
echo.

REM Method 1: Use start command (works on most Windows versions)
start http://localhost:3000

REM Method 2: Try Chrome if start doesn't work
timeout /t 2 /nobreak >nul
start chrome.exe http://localhost:3000 2>nul

REM Method 3: Try Edge if Chrome doesn't work
timeout /t 1 /nobreak >nul
start msedge.exe http://localhost:3000 2>nul

echo.
echo Browser should be opening now...
echo If not, manually open: http://localhost:3000
echo.
timeout /t 3 /nobreak >nul
exit

