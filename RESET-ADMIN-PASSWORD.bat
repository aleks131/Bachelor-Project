@echo off
title Salling Unified Application - Reset Admin Password
color 0C
cd /d "%~dp0"

echo.
echo ========================================
echo   Reset Admin Password
echo ========================================
echo.
set /p NEW_PASSWORD="Enter new password for admin user: "

if "%NEW_PASSWORD%"=="" (
    echo ERROR: Password cannot be empty
    pause
    exit /b 1
)

echo.
echo Resetting password...
node backend/reset-password.js admin %NEW_PASSWORD%

if errorlevel 1 (
    echo.
    echo ERROR: Failed to reset password
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Password Reset Successful!
echo ========================================
echo.
echo Admin password has been changed.
echo.
pause

