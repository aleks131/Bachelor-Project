@echo off
setlocal
echo ===================================================
echo     SMART SOLUTIONS - DIAGNOSTIC & FIX
echo ===================================================
echo.

echo [1/7] Checking Node.js installation...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo    ✗ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
node --version
echo    ✓ Node.js found

echo.
echo [2/7] Checking dependencies...
if not exist "node_modules" (
    echo    ✗ Dependencies not installed!
    echo    Running npm install...
    call npm install
    if %errorlevel% neq 0 (
        echo    ✗ Failed to install dependencies!
        pause
        exit /b 1
    )
)
echo    ✓ Dependencies installed

echo.
echo [3/7] Stopping existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    ✓ Processes stopped

echo.
echo [4/7] Checking port 3000...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ! Port 3000 is in use
    echo    Finding process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        echo    Killing process %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)
echo    ✓ Port 3000 is available

echo.
echo [5/7] Verifying data files...
if not exist "data\users.json" (
    echo    ✗ users.json missing! Creating default...
    call node backend\init-admin.js
)
if not exist "data\config.json" (
    echo    ✗ config.json missing! Creating default...
    echo {} > "data\config.json"
)
echo    ✓ Data files verified

echo.
echo [6/7] Testing server startup...
echo    Starting server in test mode...
start /min cmd /c "cd /d %~dp0 && node backend\server.js > test-startup.log 2>&1"
timeout /t 5 /nobreak >nul

if exist "test-startup.log" (
    findstr /i "error" "test-startup.log" >nul 2>&1
    if %errorlevel% equ 0 (
        echo    ✗ Errors found in startup log:
        type "test-startup.log" | findstr /i "error"
        del "test-startup.log"
        pause
        exit /b 1
    )
    del "test-startup.log"
)
echo    ✓ Server started successfully

echo.
echo [7/7] Verifying server is running...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo    ✗ Server is not running on port 3000!
    echo    Check backend\server.js for errors
    pause
    exit /b 1
)
echo    ✓ Server is running on port 3000

echo.
echo ===================================================
echo     DIAGNOSTIC COMPLETE
echo ===================================================
echo.
echo All checks passed! The server should be working.
echo.
echo Opening browser...
start http://localhost:3000
echo.
echo If you still have issues, check:
echo    1. Browser console (F12) for errors
echo    2. data\logs\ folder for error logs
echo    3. Firewall settings
echo.
pause

