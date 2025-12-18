# Deployment Diagram

## Real-World Deployment Architecture (Salling Group)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    NETWORK INFRASTRUCTURE                                │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │         Network Drive (Z: Drive)                              │      │
│  │  \\\\salling-server\\shared\\unified-app\\                    │      │
│  │                                                               │      │
│  │  ┌────────────────────────────────────────────────────┐     │      │
│  │  │  Application Folder (UNIFIED-APP)                  │     │      │
│  │  │  ├── backend/          (Server Code)                │     │      │
│  │  │  ├── frontend/         (Client Code)                │     │      │
│  │  │  ├── data/             (JSON Storage)               │     │      │
│  │  │  ├── node_modules/     (Dependencies)               │     │      │
│  │  │  ├── package.json      (Configuration)              │     │      │
│  │  │  └── START-SERVER.bat  (Startup Script)             │     │      │
│  │  └────────────────────────────────────────────────────┘     │      │
│  │                                                               │      │
│  │  ┌────────────────────────────────────────────────────┐     │      │
│  │  │  Content Folders                                    │     │      │
│  │  │  ├── Images/        (Gallery Content)               │     │      │
│  │  │  ├── Schedules/     (Daily Plan Content)            │     │      │
│  │  │  └── KPI/           (Dashboard Content)             │     │      │
│  │  └────────────────────────────────────────────────────┘     │      │
│  └──────────────────────────────────────────────────────────────┘      │
└───────────────────────────────────────────────────────────────────────────┘
                              │
                              │ Network Mapping
                              │ (SMB/CIFS Protocol)
                              │
┌─────────────────────────────▼───────────────────────────────────────────┐
│                    RASPBERRY PI ZERO 2 W                                 │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │         Operating System (Raspberry Pi OS)                     │      │
│  │                                                               │      │
│  │  ┌────────────────────────────────────────────────────┐      │      │
│  │  │  Network Drive Mapping                             │      │      │
│  │  │  Z: → \\\\salling-server\\shared\\unified-app\\     │      │      │
│  │  └────────────────────────────────────────────────────┘      │      │
│  │                                                               │      │
│  │  ┌────────────────────────────────────────────────────┐      │      │
│  │  │  Node.js Runtime (v18+)                            │      │      │
│  │  │  - Executes server.js                              │      │      │
│  │  │  - Manages dependencies                             │      │      │
│  │  └────────────────────────────────────────────────────┘      │      │
│  │                                                               │      │
│  │  ┌────────────────────────────────────────────────────┐      │      │
│  │  │  Application Server                                │      │      │
│  │  │  - Express.js (Port 3000)                          │      │      │
│  │  │  - WebSocket Server                                │      │      │
│  │  │  - File Watcher (Chokidar)                         │      │      │
│  │  └────────────────────────────────────────────────────┘      │      │
│  │                                                               │      │
│  │  ┌────────────────────────────────────────────────────┐      │      │
│  │  │  Startup Script (start-enhanced.bat)             │      │      │
│  │  │  1. Check Node.js installed                       │      │      │
│  │  │  2. Install dependencies (if needed)              │      │      │
│  │  │  3. Initialize data directories                   │      │      │
│  │  │  4. Start Node.js server                          │      │      │
│  │  │  5. Open browser in kiosk mode                    │      │      │
│  │  └────────────────────────────────────────────────────┘      │      │
│  └──────────────────────────────────────────────────────────────┘      │
└───────────────────────────────────────────────────────────────────────────┘
                              │
                              │ HDMI Connection
                              │
┌─────────────────────────────▼───────────────────────────────────────────┐
│                    DISPLAY SCREEN                                        │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │         HDMI Screen (1920x1080)                               │      │
│  │                                                               │      │
│  │  ┌────────────────────────────────────────────────────┐      │      │
│  │  │  Chrome Browser (Kiosk Mode)                       │      │      │
│  │  │  - Fullscreen                                      │      │      │
│  │  │  - No address bar                                  │      │      │
│  │  │  - Auto-start: http://localhost:3000              │      │      │
│  │  └────────────────────────────────────────────────────┘      │      │
│  │                                                               │      │
│  │  ┌────────────────────────────────────────────────────┐      │      │
│  │  │  Application UI                                    │      │      │
│  │  │  - Dashboard                                       │      │      │
│  │  │  - Applications                                    │      │      │
│  │  │  - Real-time Updates                               │      │      │
│  │  └────────────────────────────────────────────────────┘      │      │
│  └──────────────────────────────────────────────────────────────┘      │
└───────────────────────────────────────────────────────────────────────────┘
```

## Deployment Steps

### Step 1: Network Drive Setup
```
1. Create folder on network server: \\server\share\unified-app\
2. Copy entire UNIFIED-APP folder to network drive
3. Set appropriate permissions (read/write for users)
```

### Step 2: Raspberry Pi Configuration
```
1. Install Raspberry Pi OS
2. Install Node.js (v18+)
3. Map network drive:
   - Windows: net use Z: \\server\share\unified-app
   - Linux: mount -t cifs //server/share/unified-app /mnt/unified-app
4. Configure auto-mount on boot
```

### Step 3: Application Setup
```
1. Navigate to mapped drive: cd Z:\unified-app (or /mnt/unified-app)
2. Install dependencies: npm install
3. Initialize admin user: node backend/init-admin.js
4. Configure network paths in users.json
```

### Step 4: Startup Configuration
```
1. Create startup script (start-enhanced.bat or start.sh)
2. Configure auto-start on boot:
   - Windows: Task Scheduler
   - Linux: systemd service or rc.local
3. Configure browser kiosk mode:
   - Chrome: --kiosk --app=http://localhost:3000
```

### Step 5: Browser Kiosk Mode Setup

**Windows (Chrome):**
```batch
start chrome.exe --kiosk --app=http://localhost:3000
```

**Linux (Chrome):**
```bash
chromium-browser --kiosk --app=http://localhost:3000
```

**Auto-start Configuration:**
```bash
# Add to ~/.bashrc or systemd service
cd /mnt/unified-app && npm start &
sleep 5 && chromium-browser --kiosk --app=http://localhost:3000
```

## File Structure on Network Drive

```
Z:\unified-app\
├── backend/
│   ├── server.js
│   ├── auth.js
│   ├── routes/
│   └── utils/
├── frontend/
│   ├── dashboard.html
│   ├── apps/
│   ├── scripts/
│   └── styles/
├── data/
│   ├── users.json
│   ├── config.json
│   ├── layouts/
│   ├── backups/
│   └── logs/
├── node_modules/
├── package.json
├── START-SERVER.bat
├── QUICK-START-ALL.bat
└── README.md
```

## Network Drive Mapping

### Windows Mapping
```batch
net use Z: \\salling-server\shared\unified-app /persistent:yes
```

### Linux Mapping
```bash
# Install cifs-utils
sudo apt-get install cifs-utils

# Create mount point
sudo mkdir -p /mnt/unified-app

# Mount network drive
sudo mount -t cifs //salling-server/shared/unified-app /mnt/unified-app \
  -o username=user,password=pass,uid=1000,gid=1000

# Auto-mount on boot (/etc/fstab)
//salling-server/shared/unified-app /mnt/unified-app cifs \
  username=user,password=pass,uid=1000,gid=1000 0 0
```

## Startup Script Details

### start-enhanced.bat (Windows)
```batch
@echo off
cd /d Z:\unified-app

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js not found!
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install

echo Starting server...
start "Smart Solutions Server" node backend/server.js

timeout /t 3 /nobreak >nul

echo Opening browser...
start chrome.exe --kiosk --app=http://localhost:3000
```

### start.sh (Linux)
```bash
#!/bin/bash
cd /mnt/unified-app

echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js not found!"
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Starting server..."
node backend/server.js &
SERVER_PID=$!

sleep 3

echo "Opening browser..."
chromium-browser --kiosk --app=http://localhost:3000 &

wait $SERVER_PID
```

## Systemd Service (Linux)

### /etc/systemd/system/smart-solutions.service
```ini
[Unit]
Description=Smart Solutions by TripleA
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/mnt/unified-app
ExecStart=/usr/bin/node backend/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Enable Service
```bash
sudo systemctl enable smart-solutions.service
sudo systemctl start smart-solutions.service
```

## Deployment Checklist

- [ ] Network drive created and accessible
- [ ] Application folder copied to network drive
- [ ] Node.js installed on Raspberry Pi
- [ ] Network drive mapped on Raspberry Pi
- [ ] Dependencies installed (`npm install`)
- [ ] Admin user initialized
- [ ] Network paths configured in users.json
- [ ] Startup script created and tested
- [ ] Browser kiosk mode configured
- [ ] Auto-start configured (systemd/Task Scheduler)
- [ ] Firewall rules configured (port 3000)
- [ ] Test deployment end-to-end

## Multi-Location Deployment

```
                    ┌──────────────────┐
                    │  Network Server   │
                    │  (Central)       │
                    └────────┬─────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
        ┌───────────┐  ┌───────────┐  ┌───────────┐
        │Location 1 │  │Location 2 │  │Location 3 │
        │Pi Zero 2W │  │Pi Zero 2W │  │Pi Zero 2W │
        └───────────┘  └───────────┘  └───────────┘
```

Each Raspberry Pi:
- Maps the same network drive
- Runs the same application code
- Has location-specific user configurations
- Displays location-specific content

---

**Purpose**: This deployment diagram shows how the standalone application is deployed in the real world (Salling Group), demonstrating the network drive architecture, Raspberry Pi setup, and browser kiosk mode configuration, proving the system's deployability and ease of setup.


