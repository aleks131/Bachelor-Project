@echo off
title Salling Unified Application - Initial Setup
color 0E
cd /d "%~dp0"

echo.
echo ========================================
echo   Initial Setup
echo ========================================
echo.
echo This will:
echo   1. Install dependencies
echo   2. Create admin user
echo   3. Create test users
echo   4. Create test images
echo.
pause

echo.
echo [1/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Creating admin user...
call node backend/init-admin.js
if errorlevel 1 (
    echo ERROR: Failed to create admin user
    pause
    exit /b 1
)

echo.
echo [3/4] Creating test users...
call node backend/init-test-data.js
if errorlevel 1 (
    echo ERROR: Failed to create test users
    pause
    exit /b 1
)

echo.
echo [4/4] Creating test images...
call node backend/utils/create-test-media-sharp.js
if errorlevel 1 (
    echo WARNING: Failed to create test images (may need Sharp package)
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Default login credentials:
echo   Admin: admin / admin123
echo   Manager: manager1 / manager123
echo   Operator: operator1 / operator123
echo   Demo: demo / demo123
echo.
echo To start the server, run: START-SERVER.bat
echo.
pause

