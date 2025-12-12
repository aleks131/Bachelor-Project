@echo off
title Salling Unified Application
color 0A

echo.
echo ========================================
echo   Salling Unified Application
echo   Version 2.0
echo ========================================
echo.

:: Check if Node.js is installed
echo [1/5] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from:
    echo https://nodejs.org/
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Display Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo       Node.js version: %NODE_VERSION%
echo       [OK]
echo.

:: Check if npm is available
echo [2/5] Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo       [WARNING] npm not found, but continuing...
) else (
    echo       [OK]
)
echo.

:: Check/Install dependencies
echo [3/5] Checking dependencies...
if not exist "node_modules" (
    echo       Dependencies not found. Installing...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to install dependencies!
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo       [OK] Dependencies installed
) else (
    echo       [OK] Dependencies found
)
echo.

:: Initialize admin user if needed
echo [4/5] Checking user data...
if not exist "data\users.json" (
    echo       Initializing admin user...
    node backend/init-admin.js
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [WARNING] Failed to initialize admin user!
        echo       You may need to run this manually: node backend/init-admin.js
    ) else (
        echo       [OK] Admin user created
        echo.
        echo       Default login:
        echo       Username: admin
        echo       Password: admin123
        echo.
        echo       Please change the password after first login!
        echo.
    )
) else (
    echo       [OK] User data found
)
echo.

:: Check data directories
echo [5/5] Checking data directories...
if not exist "data" mkdir data
if not exist "data\image-cache" mkdir data\image-cache
if not exist "data\thumbnails" mkdir data\thumbnails
if not exist "data\layouts" mkdir data\layouts
echo       [OK] Directories ready
echo.

:: Display startup info
echo ========================================
echo   Starting server...
echo ========================================
echo.
echo   Application will be available at:
echo   http://localhost:3000
echo.
echo   Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

:: Wait a moment
timeout /t 2 /nobreak > nul

:: Open browser (optional - uncomment if desired)
:: start http://localhost:3000

:: Start the server
node backend/server.js

:: If server exits, pause to see any error messages
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo   Server stopped with error code: %ERRORLEVEL%
    echo ========================================
    echo.
    pause
)
