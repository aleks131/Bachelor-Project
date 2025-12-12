# 🚀 How to Run and Test the Application

## 📋 Quick Start (Easiest Method)

### Step 1: Navigate to the Project Folder
Open File Explorer and go to:
```
C:\Users\pro13\OneDrive\Desktop\BACHELOR PROJECT\SOFTWARE\UNIFIED-APP
```

### Step 2: Double-Click the Batch File
**Double-click `QUICK-START-ALL.bat`**

This will:
- ✅ Check if dependencies are installed
- ✅ Install them if needed
- ✅ Start the server
- ✅ Open your browser automatically

### Step 3: Wait for Browser to Open
The browser will open automatically at: **http://localhost:3000**

---

## 🔧 Alternative Methods

### Method 1: Using Batch File (Recommended)
1. Navigate to `UNIFIED-APP` folder
2. Double-click `START-SERVER.bat`
3. Open browser manually: http://localhost:3000

### Method 2: Using Command Line
1. Open PowerShell or Command Prompt
2. Navigate to the project:
   ```powershell
   cd "C:\Users\pro13\OneDrive\Desktop\BACHELOR PROJECT\SOFTWARE\UNIFIED-APP"
   ```
3. Start the server:
   ```powershell
   npm start
   ```
4. Open browser: http://localhost:3000

### Method 3: Using VS Code Terminal
1. Open VS Code in the `UNIFIED-APP` folder
2. Open terminal (Ctrl + `)
3. Run: `npm start`
4. Open browser: http://localhost:3000

---

## 🔐 Login Credentials

### Default Accounts:
- **Admin**: 
  - Username: `admin`
  - Password: `admin123`
  - Access: Full access to everything

- **Manager**: 
  - Username: `manager1`
  - Password: `manager123`
  - Access: Gallery, Dashboard

- **Operator**: 
  - Username: `operator1`
  - Password: `operator123`
  - Access: Daily Plan Viewer

- **Demo**: 
  - Username: `demo`
  - Password: `demo123`
  - Access: All apps

---

## ✅ Testing Checklist

### 1. 🔐 Test Login Page
- [ ] Open http://localhost:3000
- [ ] See premium UI with large buttons and titles
- [ ] Enter username: `admin`
- [ ] Enter password: `admin123`
- [ ] Click "Login" button
- [ ] Should redirect to dashboard

**Expected Result**: 
- ✅ Large, prominent login button
- ✅ Gradient title text
- ✅ Smooth animations
- ✅ Redirects to dashboard after login

---

### 2. 📊 Test Dashboard
- [ ] See dashboard with app cards
- [ ] Cards have glass morphism effect
- [ ] Hover over cards - should lift and glow
- [ ] Click on "Daily Plan Viewer" card
- [ ] Click on "Image Gallery" card
- [ ] Click on "Performance Dashboard" card
- [ ] (If admin) Click on "Admin Panel" card

**Expected Result**:
- ✅ Large, bold app names
- ✅ Premium card design
- ✅ Smooth hover animations
- ✅ Cards navigate to applications

---

### 3. 📅 Test Daily Plan Viewer
- [ ] Open Daily Plan Viewer
- [ ] Should show current schedule based on time:
  - Morning: 06:30 - 14:29
  - Evening: 14:30 - 22:29
  - Night: 22:30 - 06:29
- [ ] Should display schedule image
- [ ] Test fullscreen (F11 or button)
- [ ] Test refresh button

**Expected Result**:
- ✅ Shows correct schedule for current time
- ✅ Displays test image (morning/evening/night schedule)
- ✅ Fullscreen works
- ✅ Refresh updates content

---

### 4. 🖼️ Test Image Gallery
- [ ] Open Image Gallery
- [ ] Select folder from dropdown (folder1 or folder2)
- [ ] Select image from image dropdown
- [ ] Image should display
- [ ] Test Previous/Next buttons
- [ ] Test Play button (slideshow)
- [ ] Test zoom (mouse wheel)
- [ ] Test pan (drag image)
- [ ] Test Meeting mode

**Expected Result**:
- ✅ Shows test images from folders
- ✅ Can navigate between images
- ✅ Slideshow works
- ✅ Zoom and pan work
- ✅ Meeting mode goes fullscreen

---

### 5. 📈 Test Performance Dashboard
- [ ] Open Performance Dashboard
- [ ] See KPI cards displayed
- [ ] Drag KPI cards to rearrange
- [ ] Select file source (Main/Extra/KPI)
- [ ] Click on image to assign to KPI card
- [ ] Image should load in card
- [ ] Test Meeting mode

**Expected Result**:
- ✅ KPI cards display
- ✅ Can drag and rearrange cards
- ✅ Can assign images to cards
- ✅ Test images load correctly
- ✅ Meeting mode works

---

### 6. 👨‍💼 Test Admin Panel (Admin Only)
- [ ] Login as admin
- [ ] Click "Admin Panel" card
- [ ] See admin interface
- [ ] Test Users tab:
  - View users list
  - Create new user
  - Edit user
  - Delete user
- [ ] Test System Tools:
  - Run Diagnostics
  - Health Check
- [ ] Test Backup & Restore:
  - Create backup
  - View backups
  - Restore backup

**Expected Result**:
- ✅ Admin panel accessible
- ✅ User management works
- ✅ System tools functional
- ✅ Backup/restore works

---

### 7. 🔍 Test Global Search
- [ ] Press **Ctrl+K** from any page
- [ ] Search box should appear
- [ ] Type search term (e.g., "image")
- [ ] Results should appear instantly
- [ ] Click on result to navigate

**Expected Result**:
- ✅ Search opens with Ctrl+K
- ✅ Shows results instantly
- ✅ Can navigate to files

---

### 8. 🎨 Test UI Features
- [ ] Check button sizes (should be large and prominent)
- [ ] Check title sizes (should be bold and large)
- [ ] Check input fields (should be large and well-styled)
- [ ] Check card design (glass morphism effect)
- [ ] Test hover effects on buttons and cards
- [ ] Check animations (should be smooth)

**Expected Result**:
- ✅ Buttons are large and prominent
- ✅ Titles are bold and eye-catching
- ✅ Inputs are well-styled
- ✅ Cards have premium design
- ✅ Smooth animations throughout

---

## 🐛 Troubleshooting

### Server Won't Start?
1. **Check Node.js is installed**:
   ```powershell
   node --version
   ```
   Should show v14 or higher

2. **Install dependencies**:
   ```powershell
   cd "C:\Users\pro13\OneDrive\Desktop\BACHELOR PROJECT\SOFTWARE\UNIFIED-APP"
   npm install
   ```

3. **Check port 3000 is available**:
   - Close any other applications using port 3000
   - Or change port in `data/config.json`

### Can't Login?
1. **Create admin user**:
   ```powershell
   cd "C:\Users\pro13\OneDrive\Desktop\BACHELOR PROJECT\SOFTWARE\UNIFIED-APP"
   node backend/init-admin.js
   ```

2. **Reset password**:
   - Double-click `RESET-ADMIN-PASSWORD.bat`
   - Or run: `node backend/reset-password.js admin <new-password>`

### No Images Showing?
1. **Create test images**:
   ```powershell
   cd "C:\Users\pro13\OneDrive\Desktop\BACHELOR PROJECT\SOFTWARE\UNIFIED-APP"
   node backend/utils/create-test-media-sharp.js
   ```
   Or double-click `CREATE-TEST-IMAGES.bat`

2. **Check image paths**:
   - Images should be in `data/test-images/`
   - Check Admin Panel → Users → Network Paths

### Browser Shows Errors?
1. **Check browser console** (F12):
   - Look for red errors
   - Check network tab for failed requests

2. **Clear browser cache**:
   - Press Ctrl+Shift+Delete
   - Clear cached images and files

---

## 📊 Expected Test Results

### ✅ All Tests Should Pass:
- ✅ Login works with all accounts
- ✅ Dashboard displays correctly
- ✅ All three apps accessible
- ✅ Images load and display
- ✅ UI is premium and professional
- ✅ Buttons are large and prominent
- ✅ Titles are bold and eye-catching
- ✅ Animations are smooth
- ✅ All features functional

---

## 🎯 Quick Test Summary

1. **Start**: Double-click `QUICK-START-ALL.bat`
2. **Login**: `admin` / `admin123`
3. **Test Dashboard**: Click app cards
4. **Test Daily Plan**: Should show schedule
5. **Test Gallery**: Should show images
6. **Test Dashboard**: Should show KPI cards
7. **Verify UI**: Everything should look premium

---

## 📝 Test Report Template

After testing, document results:

```
Date: ___________
Tester: ___________

✅ Login: PASS / FAIL
✅ Dashboard: PASS / FAIL
✅ Daily Plan: PASS / FAIL
✅ Gallery: PASS / FAIL
✅ Performance Dashboard: PASS / FAIL
✅ Admin Panel: PASS / FAIL
✅ UI Quality: PASS / FAIL

Issues Found:
1. ________________
2. ________________

Overall Status: ✅ PASS / ❌ FAIL
```

---

**Happy Testing!** 🚀

If you encounter any issues, check the troubleshooting section above.

