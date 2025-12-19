@echo off
setlocal
echo ===================================================
echo     SMART SOLUTIONS - COMPLETE SYSTEM RESET
echo ===================================================
echo.
echo WARNING: This will reset all users, configuration,
echo          and clear all caches and logs.
echo.
echo Press CTRL+C to cancel, or
pause

echo.
echo [1/6] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/6] Resetting users.json to default admin...
(
echo {
echo   "users": [
echo     {
echo       "id": 1,
echo       "username": "admin",
echo       "password": "$2a$10$rmMrlUfPrzy4/wj9wdgRQ.doXoKzAAsJNL3.a9I3hMpMyBtPqfFc2",
echo       "role": "admin",
echo       "allowedApps": [
echo         "daily-plan",
echo         "gallery",
echo         "dashboard",
echo         "user-guide"
echo       ],
echo       "networkPaths": {
echo         "main": "data/content/demo-images",
echo         "extra": "data/content/demo-images",
echo         "kpi": "data/content/demo-images/kpi",
echo         "dailyPlan": "data/content/demo-images/daily-plan",
echo         "gallery": "data/content/demo-images/gallery"
echo       },
echo       "lastUsedApp": "dashboard",
echo       "preferences": {}
echo     }
echo   ],
echo   "defaultPassword": "admin123"
echo }
) > "data\users.json"
echo    ✓ Users reset to default admin

echo [3/6] Resetting config.json to defaults...
(
echo {
echo   "server": {
echo     "port": 3000,
echo     "sessionSecret": "salling-unified-secret-key-change-in-production",
echo     "jwtSecret": "salling-unified-jwt-secret-key-change-in-production",
echo     "sessionMaxAge": 86400000,
echo     "jwtExpiresIn": "7d",
echo     "jwtRefreshExpiresIn": "30d",
echo     "enableCaching": true
echo   },
echo   "apps": {
echo     "daily-plan": {
echo       "name": "Daily Plan Viewer",
echo       "description": "View daily plans based on time schedules",
echo       "icon": "📅",
echo       "enabled": true,
echo       "refreshInterval": 60000,
echo       "maxImageSize": 5242880
echo     },
echo     "gallery": {
echo       "name": "Image Gallery",
echo       "description": "Browse and display images/videos with slideshow",
echo       "icon": "🖼️",
echo       "enabled": true,
echo       "slideshowInterval": 5000,
echo       "thumbnailSize": 200,
echo       "maxImageSize": 10485760
echo     },
echo     "dashboard": {
echo       "name": "Performance Dashboard",
echo       "description": "KPI dashboard with customizable layouts",
echo       "icon": "📊",
echo       "enabled": true,
echo       "refreshInterval": 30000,
echo       "meetingMode": false
echo     }
echo   },
echo   "imageProcessing": {
echo     "enabled": true,
echo     "generateThumbnails": true,
echo     "thumbnailQuality": 80,
echo     "thumbnailSize": 200,
echo     "optimizeImages": true,
echo     "maxImageDimension": 4096,
echo     "cacheDuration": 86400000
echo   },
echo   "fileManagement": {
echo     "allowDelete": true,
echo     "allowRename": true,
echo     "allowMove": true,
echo     "allowCopy": true,
echo     "maxFileSize": 1073741824,
echo     "allowedFileTypes": []
echo   },
echo   "ui": {
echo     "defaultTheme": "dark",
echo     "enableNotifications": true,
echo     "enableToast": true,
echo     "enableKeyboardShortcuts": true,
echo     "enableContextMenu": true,
echo     "itemsPerPage": 50
echo   },
echo   "search": {
echo     "enabled": true,
echo     "maxResults": 100,
echo     "enableHistory": true,
echo     "historyLimit": 10
echo   },
echo   "analytics": {
echo     "enabled": true,
echo     "trackPageViews": true,
echo     "trackFileOperations": true,
echo     "trackSearches": true,
echo     "retentionDays": 90
echo   },
echo   "supportedFormats": [
echo     ".jpg", ".jpeg", ".png", ".gif",
echo     ".webp", ".bmp", ".tiff", ".svg",
echo     ".avif", ".heic", ".ico",
echo     ".mp4", ".webm", ".ogg", ".mov",
echo     ".avi", ".mkv", ".flv",
echo     ".pdf", ".ppt", ".pptx"
echo   ]
echo }
) > "data\config.json"
echo    ✓ Configuration reset to defaults

echo [4/6] Clearing caches and temporary files...
if exist "data\image-cache" (
    echo    - Clearing image cache...
    del /q "data\image-cache\*.*" >nul 2>&1
)
if exist "data\thumbnails" (
    echo    - Clearing thumbnails...
    del /q "data\thumbnails\*.*" >nul 2>&1
)
if exist "data\ai-cache" (
    echo    - Clearing AI cache...
    del /q "data\ai-cache\*.*" >nul 2>&1
)
echo    ✓ Caches cleared

echo [5/6] Clearing logs...
if exist "data\logs" (
    echo    - Clearing log files...
    del /q "data\logs\*.log" >nul 2>&1
)
echo    ✓ Logs cleared

echo [6/6] Resetting analytics...
(
echo {}
) > "data\analytics.json"
echo    ✓ Analytics reset

echo.
echo ===================================================
echo     RESET COMPLETE
echo ===================================================
echo.
echo Default Login Credentials:
echo    Username: admin
echo    Password: admin123
echo.
echo Starting server...
echo.

start cmd /k "cd /d %~dp0 && node backend/server.js"
timeout /t 5 /nobreak >nul

echo Opening browser...
start http://localhost:3000

echo.
echo ===================================================
echo     SYSTEM RESET COMPLETE
echo ===================================================
echo.
echo The software has been reset to factory defaults.
echo All users except admin have been removed.
echo All caches and logs have been cleared.
echo.
echo You can now log in with:
echo    Username: admin
echo    Password: admin123
echo.
pause
