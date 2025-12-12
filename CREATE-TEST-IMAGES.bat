@echo off
title Salling Unified Application - Create Test Images
color 0D
cd /d "%~dp0"

echo.
echo ========================================
echo   Creating Test Images
echo ========================================
echo.
echo This will create test images for:
echo   - Daily Plan Viewer (Morning/Evening/Night)
echo   - Image Gallery (folder1, folder2)
echo   - Performance Dashboard (KPI images)
echo.
pause

node backend/utils/create-test-media-sharp.js

echo.
echo ========================================
echo   Test Images Created!
echo ========================================
echo.
pause

