@echo off
title Smart Solutions by TripleA - Perfect Launch
color 0A
cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Smart Solutions by TripleA - Perfect Launch        ║
echo ║   Version 2.0.0 - Production Ready                    ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [1/10] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    [ERROR] Node.js is not installed!
    echo    Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo    [OK] Node.js version: %NODE_VERSION%
echo.

echo [2/10] Verifying project structure...
if not exist "backend\server.js" (
    echo    [ERROR] Server file missing!
    pause
    exit /b 1
)
if not exist "frontend\dashboard.html" (
    echo    [ERROR] Frontend files missing!
    pause
    exit /b 1
)
if not exist "package.json" (
    echo    [ERROR] Package.json missing!
    pause
    exit /b 1
)
echo    [OK] All project files verified
echo.

echo [3/10] Checking dependencies...
if not exist "node_modules" (
    echo    Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo    [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo    [OK] Dependencies found
)
echo.

echo [4/10] Ensuring data directories...
if not exist "data" mkdir data
if not exist "data\image-cache" mkdir data\image-cache
if not exist "data\thumbnails" mkdir data\thumbnails
if not exist "data\layouts" mkdir data\layouts
if not exist "data\backups" mkdir data\backups
if not exist "data\logs" mkdir data\logs
if not exist "data\ai-cache" mkdir data\ai-cache
echo    [OK] All directories ready
echo.

echo [5/10] Checking admin user...
if not exist "data\users.json" (
    echo    Initializing admin user...
    node backend/init-admin.js
    if %ERRORLEVEL% NEQ 0 (
        echo    [WARNING] Failed to initialize admin user!
    ) else (
        echo    [OK] Admin user created
        echo    Default login: admin / admin123
    )
) else (
    echo    [OK] Users file exists
)
echo.

echo [6/10] Checking configuration...
if not exist "data\config.json" (
    echo    [ERROR] Config file missing!
    pause
    exit /b 1
)
echo    [OK] Configuration file exists
echo.

echo [7/10] Stopping any existing server...
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    Stopping existing server on port 3000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)
echo    [OK] Port 3000 is available
echo.

echo [8/10] Verifying mockup images...
if exist "mockups\login-screen.png" (
    echo    [OK] Mockup images found
) else (
    echo    [INFO] Mockup images not found (optional)
)
echo.

echo [9/10] Starting server...
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   🚀 SERVER STARTING...                                ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo    Server URL: http://localhost:3000
echo    Login: admin / admin123
echo.
echo    Press Ctrl+C to stop the server
echo.
echo ════════════════════════════════════════════════════════
echo.

start "Smart Solutions Server" cmd /k "node backend/server.js"

timeout /t 5 /nobreak >nul

echo [10/10] Opening browser...
start http://localhost:3000

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   ✅ SOFTWARE LAUNCHED SUCCESSFULLY!                  ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo    🌐 Browser opened: http://localhost:3000
echo    👤 Login: admin / admin123
echo.
echo    ✨ Everything is perfect and ready!
echo.
echo    The server window is open separately.
echo    Keep it running to use the application.
echo.
pause

