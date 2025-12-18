@echo off
title Smart Solutions by TripleA - Setup
color 0A
cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Smart Solutions by TripleA - Initial Setup        ║
echo ║   Version 2.0.0                                      ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [1/4] Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    ❌ Node.js is not installed!
    echo    Please install from: https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo    ✅ Node.js found
echo.

echo [2/4] Installing dependencies...
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo    ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo    ✅ Dependencies installed
) else (
    echo    ✅ Dependencies already installed
)
echo.

echo [3/4] Creating data directories...
if not exist "data" mkdir data
if not exist "data\image-cache" mkdir data\image-cache
if not exist "data\thumbnails" mkdir data\thumbnails
if not exist "data\layouts" mkdir data\layouts
if not exist "data\backups" mkdir data\backups
if not exist "data\logs" mkdir data\logs
if not exist "data\ai-cache" mkdir data\ai-cache
echo    ✅ Directories created
echo.

echo [4/4] Initializing admin user...
if not exist "data\users.json" (
    node backend/init-admin.js
    if %ERRORLEVEL% EQU 0 (
        echo    ✅ Admin user created
        echo    Login: admin / admin123
    ) else (
        echo    ⚠️  Admin user may already exist
    )
) else (
    echo    ✅ Users file exists
)
echo.

echo ╔════════════════════════════════════════════════════════╗
echo ║   ✅ SETUP COMPLETE!                                  ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo    Run START.bat to launch the software
echo.
pause


