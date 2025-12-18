# High-Level Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HARDWARE LAYER                                   │
│                                                                           │
│  ┌──────────────────┐         ┌──────────────────┐                    │
│  │  Raspberry Pi     │         │   HDMI Screen    │                    │
│  │  Zero 2 W        │─────────▶│   (Display)      │                    │
│  │                  │  HDMI    │                   │                    │
│  └────────┬─────────┘          └──────────────────┘                    │
│           │                                                               │
│           │ USB                                                           │
│           │                                                               │
│  ┌────────▼─────────┐                                                    │
│  │   USB Drive      │                                                    │
│  │   (Storage)      │                                                    │
│  └──────────────────┘                                                    │
└───────────────────────────────────────────────────────────────────────────┘
                              │
                              │ Network Connection
                              │
┌─────────────────────────────▼───────────────────────────────────────────┐
│                      SOFTWARE LAYER                                       │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │              Node.js Server (Raspberry Pi)                   │        │
│  │                                                              │        │
│  │  ┌────────────────────────────────────────────────────┐     │        │
│  │  │         Express.js (REST API Server)                │     │        │
│  │  │  - Port 3000                                        │     │        │
│  │  │  - Static File Serving                              │     │        │
│  │  │  - API Endpoints                                    │     │        │
│  │  └────────────────────────────────────────────────────┘     │        │
│  │                                                              │        │
│  │  ┌────────────────────────────────────────────────────┐     │        │
│  │  │         WebSocket Server (Real-Time)                │     │        │
│  │  │  - Bi-directional Communication                    │     │        │
│  │  │  - Live Updates                                    │     │        │
│  │  └────────────────────────────────────────────────────┘     │        │
│  │                                                              │        │
│  │  ┌────────────────────────────────────────────────────┐     │        │
│  │  │         Chokidar (File System Watcher)             │     │        │
│  │  │  - Event-Driven Monitoring                         │     │        │
│  │  │  - Network Drive Watching                          │     │        │
│  │  └────────────────────────────────────────────────────┘     │        │
│  └──────────────────────────────────────────────────────────────┘        │
└───────────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              │
┌─────────────────────────────▼───────────────────────────────────────────┐
│                    DATA SOURCE LAYER                                     │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │              Network Drive (Z:)                               │        │
│  │  - Application Folder (UNIFIED-APP)                          │        │
│  │  - Content Folders (Images, Schedules, KPIs)                 │        │
│  │  - Shared Storage                                            │        │
│  └──────────────────────────────────────────────────────────────┘        │
└───────────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests
                              │
┌─────────────────────────────▼───────────────────────────────────────────┐
│                    USER INTERFACE LAYER                                   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │         Client Browser (Chrome/Kiosk Mode)                   │        │
│  │                                                              │        │
│  │  ┌────────────────────────────────────────────────────┐     │        │
│  │  │         Frontend (HTML5/CSS3/JavaScript)           │     │        │
│  │  │  - Dashboard                                        │     │        │
│  │  │  - Daily Plan Viewer                                │     │        │
│  │  │  - Image Gallery                                    │     │        │
│  │  │  - Performance Dashboard                            │     │        │
│  │  │  - Admin Panel                                      │     │        │
│  │  └────────────────────────────────────────────────────┘     │        │
│  │                                                              │        │
│  │  ┌────────────────────────────────────────────────────┐     │        │
│  │  │         WebSocket Client                            │     │        │
│  │  │  - Real-Time Updates                               │     │        │
│  │  │  - Live Synchronization                            │     │        │
│  │  └────────────────────────────────────────────────────┘     │        │
│  └──────────────────────────────────────────────────────────────┘        │
└───────────────────────────────────────────────────────────────────────────┘
```

## Component Interactions

### Data Flow
1. **Network Drive** → Provides content (images, schedules, files)
2. **Raspberry Pi** → Runs Node.js server, processes requests
3. **Chokidar** → Monitors network drive for changes
4. **WebSocket** → Pushes updates to browser in real-time
5. **Browser** → Displays UI and receives live updates

### Key Connections
- **Raspberry Pi ↔ Network Drive**: File system access via network mapping
- **Raspberry Pi ↔ Browser**: HTTP (port 3000) and WebSocket connections
- **Chokidar → WebSocket**: Event-driven updates when files change
- **Browser ↔ Network Drive**: Indirect access through server API

## Hardware Specifications

### Raspberry Pi Zero 2 W
- **CPU**: Quad-core ARM Cortex-A53 @ 1GHz
- **RAM**: 512MB
- **Storage**: MicroSD card + USB Drive
- **Network**: WiFi/ Ethernet via USB adapter
- **Display**: HDMI output to screen

### Display Requirements
- **Resolution**: 1920x1080 (Full HD)
- **Connection**: HDMI
- **Mode**: Kiosk mode (fullscreen browser)

## Network Architecture

```
                    ┌──────────────┐
                    │ Network Drive │
                    │   (Z: Drive) │
                    └───────┬───────┘
                            │
                            │ Network Share
                            │ (SMB/CIFS)
                            │
                    ┌───────▼───────┐
                    │  Raspberry Pi │
                    │   Zero 2 W    │
                    │               │
                    │  Node.js      │
                    │  Server       │
                    └───────┬───────┘
                            │
                            │ HTTP/WebSocket
                            │ (Port 3000)
                            │
                    ┌───────▼───────┐
                    │   Browser     │
                    │  (Chrome)     │
                    │  Kiosk Mode   │
                    └───────────────┘
```

## Deployment Model

### Standalone Architecture
- **No Database Server**: Uses JSON flat-files
- **No External Dependencies**: All code in one folder
- **Network Drive Based**: Application runs from mapped drive
- **Cross-Platform**: Works on Windows, Linux, macOS

### Startup Sequence
1. Raspberry Pi boots
2. Network drive mapped (Z:)
3. Node.js starts server (`npm start`)
4. Browser opens in kiosk mode
5. Application loads from `http://localhost:3000`

---

**Purpose**: This diagram shows the complete system architecture, demonstrating how hardware (Raspberry Pi, screen, network drive) and software (Node.js server, browser) interact to create the unified application platform.


