@echo off
title Smart Solutions by TripleA - Quick Start
color 0A
cd /d "%~dp0"

echo.
echo ========================================
echo   Smart Solutions by TripleA
echo ========================================
echo.
echo This will:
echo   1. Check if dependencies are installed
echo   2. Start the server
echo   3. Open browser automatically
echo.
pause

if not exist "node_modules" (
    echo.
    echo Dependencies not found. Installing...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting server...
echo.
echo Server will start on http://localhost:3000
echo Browser will open automatically in 5 seconds...
echo.
echo Press Ctrl+C to stop the server
echo.

start /b node backend/server.js

timeout /t 5 /nobreak >nul

echo Opening browser...
start http://localhost:3000

echo.
echo ========================================
echo   Server Started!
echo ========================================
echo.
echo Server is running in the background.
echo Browser should open automatically.
echo.
echo To stop the server, close this window or press Ctrl+C
echo.
pause
