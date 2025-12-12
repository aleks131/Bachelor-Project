@echo off
title Salling Unified Application - Open Browser
cd /d "%~dp0"

echo.
echo Opening browser...
echo.

start http://localhost:3000

timeout /t 2 /nobreak >nul
exit

