@echo off
title Salling Unified Application - Server
color 0A
cd /d "%~dp0"

echo.
echo ========================================
echo   Smart Solutions by TripleA - Server
echo ========================================
echo.
echo Starting server on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

node backend/server.js

pause
