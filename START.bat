@echo off
setlocal
echo ===================================================
echo     SMART SOLUTIONS - START SERVER
echo ===================================================
echo.

echo Stopping any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
)

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Starting server...
echo Server will open in browser automatically.
echo.
echo Press CTRL+C to stop the server.
echo.

cd /d "%~dp0"
node backend/server.js

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Server failed to start!
    echo Check the error message above.
    pause
)

