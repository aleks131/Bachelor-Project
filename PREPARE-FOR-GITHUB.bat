@echo off
title GitHub Upload - Smart Solutions by TripleA
color 0B
cd /d "%~dp0"

echo.
echo ========================================
echo   GitHub Upload Helper
echo   Smart Solutions by TripleA
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed!
    echo Please install Git from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo [1/4] Checking Git status...
if exist .git (
    echo Git repository already initialized.
    git status
) else (
    echo [2/4] Initializing Git repository...
    git init
    echo.
    echo [3/4] Adding files...
    git add .
    echo.
    echo [4/4] Creating initial commit...
    git commit -m "Initial commit: Smart Solutions by TripleA v2.0.0"
    echo.
    echo ✅ Git repository initialized!
    echo.
)

echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Go to GitHub.com and create a new repository
echo 2. Copy the repository URL (e.g., https://github.com/USERNAME/REPO.git)
echo 3. Run these commands:
echo.
echo    git remote add origin YOUR_REPOSITORY_URL
echo    git branch -M main
echo    git push -u origin main
echo.
echo Or use the GitHub Desktop app for easier upload.
echo.
echo ========================================
echo.
echo See GITHUB-UPLOAD-GUIDE.md for detailed instructions.
echo.
pause

