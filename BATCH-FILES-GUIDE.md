# 📁 Batch Files Guide

## 🚀 Available Batch Files

### 1. **QUICK-START-ALL.bat** ⭐ RECOMMENDED
**Easiest way to start everything**
- Checks if dependencies are installed
- Installs if needed
- Starts the server
- Opens browser automatically

**Usage**: Double-click `QUICK-START-ALL.bat`

---

### 2. **START-SERVER.bat**
**Start the server only**
- Starts the Node.js server
- Shows server status
- Press Ctrl+C to stop

**Usage**: Double-click `START-SERVER.bat`

---

### 3. **INSTALL-DEPENDENCIES.bat**
**Install all required packages**
- Runs `npm install`
- Installs all dependencies from package.json

**Usage**: Double-click `INSTALL-DEPENDENCIES.bat`

---

### 4. **INITIALIZE-SETUP.bat**
**Complete initial setup**
- Installs dependencies
- Creates admin user
- Creates test users
- Creates test images

**Usage**: Double-click `INITIALIZE-SETUP.bat` (run once for first-time setup)

---

### 5. **CREATE-TEST-IMAGES.bat**
**Create test images for applications**
- Creates images for Daily Plan Viewer
- Creates images for Image Gallery
- Creates images for Performance Dashboard

**Usage**: Double-click `CREATE-TEST-IMAGES.bat`

---

### 6. **RESET-ADMIN-PASSWORD.bat**
**Reset admin user password**
- Prompts for new password
- Updates admin password securely

**Usage**: Double-click `RESET-ADMIN-PASSWORD.bat`

---

### 7. **OPEN-IN-BROWSER.bat**
**Open application in browser**
- Opens http://localhost:3000
- Use when server is already running

**Usage**: Double-click `OPEN-IN-BROWSER.bat`

---

## 🎯 Quick Start Workflow

### First Time Setup:
1. Double-click `INITIALIZE-SETUP.bat`
2. Wait for setup to complete
3. Double-click `QUICK-START-ALL.bat`

### Daily Use:
1. Double-click `QUICK-START-ALL.bat`
2. Browser opens automatically
3. Login and use the application

---

## 📝 Notes

- All batch files must be run from the `UNIFIED-APP` directory
- Make sure Node.js is installed on your system
- Server runs on http://localhost:3000
- Press Ctrl+C in the server window to stop

---

## 🔧 Troubleshooting

### Server won't start?
- Run `INSTALL-DEPENDENCIES.bat` first
- Check if port 3000 is available
- Make sure Node.js is installed

### Can't login?
- Run `INITIALIZE-SETUP.bat` to create admin user
- Default password: `admin123`

### No test images?
- Run `CREATE-TEST-IMAGES.bat`
- Check `data/test-images/` folder

---

**Happy Using!** 🎉

