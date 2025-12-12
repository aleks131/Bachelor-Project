@echo off
title Salling Unified Application - Install Dependencies
color 0B
cd /d "%~dp0"

echo.
echo ========================================
echo   Installing Dependencies
echo ========================================
echo.
echo This will install all required packages...
echo.

npm install

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
pause

