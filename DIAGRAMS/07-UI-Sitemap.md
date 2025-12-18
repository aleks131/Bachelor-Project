# UI/UX Sitemap

## Application Structure and User Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LOGIN PAGE                                       │
│  - Username Input                                                        │
│  - Password Input                                                        │
│  - Remember Me Checkbox                                                  │
│  - Login Button                                                          │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                                │ Successful Login
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD                                        │
│  (Main App Selector)                                                     │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ Daily Plan   │  │   Gallery    │  │  Dashboard   │                 │
│  │   Viewer     │  │              │  │  (KPI)       │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│         │                 │                  │                          │
│         │                 │                  │                          │
│         ▼                 ▼                  ▼                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ Morning      │  │ Browse Mode  │  │ KPI Cards    │                 │
│  │ Evening      │  │ Slideshow    │  │ Drag & Drop  │                 │
│  │ Night        │  │ Meeting Mode │  │ Customize    │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                           │
│  ┌──────────────────────────────────────────────────────┐             │
│  │              ADMIN PANEL (Admin Only)                 │             │
│  └───────────────────────┬──────────────────────────────┘             │
│                          │                                              │
│                          ▼                                              │
│  ┌──────────────────────────────────────────────────────┐             │
│  │  Admin Panel                                         │             │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │             │
│  │  │ User Mgmt    │  │  Settings    │  │ Layout   │ │             │
│  │  │              │  │              │  │ Builder   │ │             │
│  │  └──────┬───────┘  └──────┬───────┘  └────┬──────┘ │             │
│  │         │                 │               │         │             │
│  │         ▼                 ▼               ▼         │             │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐      │             │
│  │  │ Create   │    │ Server   │    │ Visual   │      │             │
│  │  │ Edit     │    │ Apps     │    │ Editor   │      │             │
│  │  │ Delete   │    │ Image    │    │ Widgets  │      │             │
│  │  │ Reset PW │    │ Files    │    │ Save     │      │             │
│  │  └──────────┘    └──────────┘    └──────────┘      │             │
│  └──────────────────────────────────────────────────────┘             │
│                                                                           │
│  ┌──────────────────────────────────────────────────────┐             │
│  │         MONITORING DASHBOARD (Admin Only)             │             │
│  │  - System Health                                       │             │
│  │  - Performance Metrics                                 │             │
│  │  - User Activity                                       │             │
│  │  - Error Logs                                          │             │
│  └──────────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘
```

## Detailed Navigation Flow

### 1. Login Flow
```
Login Page
    │
    ├─→ Invalid Credentials → Error Message → Stay on Login
    │
    └─→ Valid Credentials → Create Session → Redirect to Dashboard
```

### 2. Dashboard Flow
```
Dashboard
    │
    ├─→ Daily Plan Viewer → View Schedule → Return to Dashboard
    │
    ├─→ Image Gallery → Browse/Slideshow → Return to Dashboard
    │
    ├─→ Performance Dashboard → View KPIs → Return to Dashboard
    │
    ├─→ Admin Panel (if admin) → Manage System → Return to Dashboard
    │
    └─→ Logout → Clear Session → Redirect to Login
```

### 3. Daily Plan Viewer Flow
```
Daily Plan Viewer
    │
    ├─→ Morning Schedule (06:30-14:29)
    │
    ├─→ Evening Schedule (14:30-22:29)
    │
    ├─→ Night Schedule (22:30-06:29)
    │
    ├─→ Fullscreen Mode
    │
    └─→ Back to Dashboard
```

### 4. Image Gallery Flow
```
Image Gallery
    │
    ├─→ Browse Mode
    │   ├─→ Select Folder
    │   ├─→ View Images (Grid)
    │   ├─→ Select Image
    │   └─→ Image Viewer
    │
    ├─→ Slideshow Mode
    │   ├─→ Auto-advance
    │   ├─→ Pause/Play
    │   └─→ Adjust Interval
    │
    ├─→ Meeting Mode
    │   ├─→ Fullscreen
    │   ├─→ Minimal UI
    │   └─→ Touch Navigation
    │
    └─→ Back to Dashboard
```

### 5. Performance Dashboard Flow
```
Performance Dashboard
    │
    ├─→ View KPI Cards
    │
    ├─→ Drag & Drop Rearrange
    │
    ├─→ Assign Images to KPIs
    │   ├─→ Select KPI Card
    │   ├─→ Choose Image Source
    │   └─→ Assign Image
    │
    ├─→ Meeting Mode
    │
    └─→ Back to Dashboard
```

### 6. Admin Panel Flow
```
Admin Panel
    │
    ├─→ User Management
    │   ├─→ View Users
    │   ├─→ Create User
    │   ├─→ Edit User
    │   ├─→ Delete User
    │   └─→ Reset Password
    │
    ├─→ System Settings
    │   ├─→ Server Settings
    │   ├─→ App Configuration
    │   ├─→ Image Processing
    │   ├─→ File Management
    │   ├─→ UI Settings
    │   └─→ Analytics Settings
    │
    ├─→ Layout Builder
    │   ├─→ Create Layout
    │   ├─→ Edit Layout
    │   ├─→ Delete Layout
    │   ├─→ Assign to Users
    │   └─→ Export/Import
    │
    ├─→ Monitoring Dashboard
    │   ├─→ System Health
    │   ├─→ Performance Metrics
    │   ├─→ User Activity
    │   └─→ Error Logs
    │
    ├─→ Backup & Restore
    │   ├─→ Create Backup
    │   ├─→ View Backups
    │   └─→ Restore Backup
    │
    └─→ Back to Dashboard
```

## User Roles and Access

### Admin User Journey
```
Login → Dashboard → [All Apps] → Admin Panel → [All Features]
```

### Manager User Journey
```
Login → Dashboard → [Assigned Apps] → Content Management → Layout Builder
```

### Operator User Journey
```
Login → Dashboard → [Assigned Apps] → View Only
```

## Global Features (Available Everywhere)

### Search (Ctrl+K)
```
Any Page → Press Ctrl+K → Search Modal → Results → Navigate
```

### Theme Toggle
```
Any Page → Theme Button → Toggle Dark/Light → Save Preference
```

### Keyboard Shortcuts
```
Any Page → Press Ctrl+/ → Shortcuts Help Modal
```

### Notifications
```
Any Page → File Change → Desktop Notification → Click to View
```

## Page Hierarchy

```
Level 1: Login Page
    │
Level 2: Dashboard (Main Hub)
    │
    ├─→ Level 3: Daily Plan Viewer
    │   └─→ Level 4: Fullscreen Mode
    │
    ├─→ Level 3: Image Gallery
    │   ├─→ Level 4: Browse Mode
    │   ├─→ Level 4: Slideshow Mode
    │   ├─→ Level 4: Meeting Mode
    │   └─→ Level 4: Image Viewer (Advanced)
    │
    ├─→ Level 3: Performance Dashboard
    │   └─→ Level 4: Meeting Mode
    │
    ├─→ Level 3: Admin Panel
    │   ├─→ Level 4: User Management
    │   ├─→ Level 4: System Settings
    │   ├─→ Level 4: Layout Builder
    │   ├─→ Level 4: Monitoring Dashboard
    │   └─→ Level 4: Backup & Restore
    │
    └─→ Level 3: Custom Layout Viewer
        └─→ Level 4: Widget Interactions
```

## Navigation Patterns

### Primary Navigation
- **Dashboard**: Central hub, always accessible
- **Applications**: Direct access from dashboard cards
- **Back Button**: Returns to dashboard

### Secondary Navigation
- **Admin Panel**: Accessible from dashboard (admin only)
- **Settings**: Within admin panel
- **Layout Builder**: Within admin panel

### Contextual Navigation
- **Image Viewer**: Previous/Next buttons
- **Gallery**: Folder selection dropdown
- **Dashboard**: KPI card rearrangement

## User Flows

### Flow 1: Viewing Daily Schedule
```
Login → Dashboard → Daily Plan Viewer → View Current Schedule → Fullscreen (optional) → Return
```

### Flow 2: Browsing Images
```
Login → Dashboard → Image Gallery → Select Folder → Browse Images → View Image → Slideshow → Return
```

### Flow 3: Managing KPIs
```
Login → Dashboard → Performance Dashboard → Drag KPI Cards → Assign Images → Meeting Mode → Return
```

### Flow 4: Admin Tasks
```
Login → Dashboard → Admin Panel → User Management → Create User → Configure Paths → Save → Return
```

### Flow 5: Creating Custom Layout
```
Login → Dashboard → Admin Panel → Layout Builder → Add Widgets → Configure → Save → Assign to Users
```

---

**Purpose**: This sitemap shows the complete user journey through the application, demonstrating the navigation structure, user flows, and how different user roles access different features, providing a clear understanding of the application's user experience.


