@echo off
echo Starting Salling Unified Application...
echo.

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

if not exist "data\users.json" (
    echo Initializing admin user...
    node backend/init-admin.js
    echo.
)

echo Starting server...
node backend/server.js

pause
