@echo off
title Smart Solutions by TripleA - Open Browser
cd /d "%~dp0"

color 0A

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Smart Solutions by TripleA - Open Browser           ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if server is running
echo [1/3] Checking if server is running...
netstat -an | find "3000" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    [WARNING] Server not detected on port 3000
    echo.
    echo    Would you like to start the server? (Y/N)
    set /p START_SERVER=
    if /i "%START_SERVER%"=="Y" (
        echo.
        echo    Starting server...
        start "Smart Solutions Server" cmd /k "node backend/server.js"
        echo    Waiting for server to start (10 seconds)...
        timeout /t 10 /nobreak >nul
    ) else (
        echo.
        echo    Please start the server first using START-SERVER.bat
        echo    Or run: npm start
        echo.
        pause
        exit /b 1
    )
) else (
    echo    [OK] Server is running
)

echo.
echo [2/3] Opening browser...
echo.

REM Try to open browser
start http://localhost:3000

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Try Chrome as backup
where chrome >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start chrome.exe http://localhost:3000 2>nul
) else (
    REM Try Edge as backup
    where msedge >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        start msedge.exe http://localhost:3000 2>nul
    )
)

echo [3/3] Browser opened!
echo.
echo    URL: http://localhost:3000
echo    Login: admin / admin123
echo.
echo    If browser didn't open, manually navigate to:
echo    http://localhost:3000
echo.
pause

