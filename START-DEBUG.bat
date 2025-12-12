@echo off
title Smart Solutions - Debug Mode
color 0E
cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Smart Solutions - DEBUG MODE                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [1] Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    ✅ Cleaned up
echo.

echo [2] Running startup test...
echo    This will show exactly where the error occurs
echo.

node test-startup.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Test completed successfully!
    echo    If you see "Server listening", everything works!
    echo    Press Ctrl+C in the server window to stop
) else (
    echo.
    echo ❌ Test failed - check error messages above
    echo    This shows exactly what's wrong
)

echo.
pause

