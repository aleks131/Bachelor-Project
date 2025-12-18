# Data Schema Documentation (JSON Structure)

## Overview

The application uses JSON flat-files for data storage, eliminating the need for a SQL database. This makes the system portable, easy to backup, and simple to understand.

---

## 1. users.json Structure

### Complete Schema
```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "password": "$2a$10$rmMrlUfPrzy4/wj9wdgRQ.doXoKzAAsJNL3.a9I3hMpMyBtPqfFc2",
      "role": "admin",
      "allowedApps": ["daily-plan", "gallery", "dashboard"],
      "networkPaths": {
        "main": "\\\\server\\share\\images",
        "dailyPlan": "\\\\server\\share\\schedules",
        "gallery": "\\\\server\\share\\gallery",
        "extra": "\\\\server\\share\\extra",
        "kpi": "\\\\server\\share\\kpi"
      },
      "lastUsedApp": "dashboard",
      "preferences": {
        "theme": "dark",
        "notifications": true
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "lastLogin": "2025-12-12T10:30:00.000Z"
    }
  ],
  "defaultPassword": "admin123"
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | Number | Unique user identifier | `1` |
| `username` | String | Login username (3-50 chars) | `"admin"` |
| `password` | String | bcrypt hashed password | `"$2a$10$..."` |
| `role` | String | User role: `admin`, `manager`, `operator` | `"admin"` |
| `allowedApps` | Array | List of accessible applications | `["daily-plan", "gallery"]` |
| `networkPaths` | Object | Network drive paths per application | See below |
| `lastUsedApp` | String | Last accessed application | `"dashboard"` |
| `preferences` | Object | User preferences (theme, notifications) | `{"theme": "dark"}` |
| `createdAt` | String | Account creation timestamp (ISO 8601) | `"2025-01-01T00:00:00.000Z"` |
| `lastLogin` | String | Last login timestamp (ISO 8601) | `"2025-12-12T10:30:00.000Z"` |

### networkPaths Object Structure
```json
{
  "main": "\\\\server\\share\\main",
  "dailyPlan": "\\\\server\\share\\schedules",
  "gallery": "\\\\server\\share\\gallery",
  "extra": "\\\\server\\share\\extra",
  "kpi": "\\\\server\\share\\kpi"
}
```

### Role-Based Examples

**Admin User:**
```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "allowedApps": ["daily-plan", "gallery", "dashboard", "admin"],
  "networkPaths": {
    "main": "Z:\\images",
    "dailyPlan": "Z:\\schedules",
    "gallery": "Z:\\gallery",
    "kpi": "Z:\\kpi"
  }
}
```

**Manager User:**
```json
{
  "id": 2,
  "username": "manager1",
  "role": "manager",
  "allowedApps": ["gallery", "dashboard"],
  "networkPaths": {
    "main": "Z:\\content",
    "gallery": "Z:\\gallery"
  }
}
```

**Operator User:**
```json
{
  "id": 3,
  "username": "operator1",
  "role": "operator",
  "allowedApps": ["daily-plan"],
  "networkPaths": {
    "dailyPlan": "Z:\\schedules"
  }
}
```

---

## 2. config.json Structure

### Complete Schema
```json
{
  "server": {
    "port": 3000,
    "sessionSecret": "change-in-production",
    "jwtSecret": "change-in-production",
    "sessionMaxAge": 86400000,
    "jwtExpiresIn": "7d",
    "jwtRefreshExpiresIn": "30d",
    "enableCaching": true
  },
  "apps": {
    "daily-plan": {
      "name": "Daily Plan Viewer",
      "description": "View daily plans based on time schedules",
      "icon": "📅",
      "enabled": true,
      "refreshInterval": 60000,
      "maxImageSize": 5242880
    },
    "gallery": {
      "name": "Image Gallery",
      "description": "Browse and display images/videos",
      "icon": "🖼️",
      "enabled": true,
      "slideshowInterval": 5000,
      "thumbnailSize": 200,
      "maxImageSize": 10485760
    },
    "dashboard": {
      "name": "Performance Dashboard",
      "description": "KPI dashboard with customizable layouts",
      "icon": "📊",
      "enabled": true,
      "refreshInterval": 30000,
      "meetingMode": false
    }
  },
  "imageProcessing": {
    "enabled": true,
    "generateThumbnails": true,
    "thumbnailQuality": 80,
    "thumbnailSize": 200,
    "optimizeImages": true,
    "maxImageDimension": 4096,
    "cacheDuration": 86400000
  },
  "fileManagement": {
    "allowDelete": true,
    "allowRename": true,
    "allowMove": true,
    "allowCopy": true,
    "maxFileSize": 1073741824,
    "allowedFileTypes": []
  },
  "ui": {
    "defaultTheme": "dark",
    "enableNotifications": true,
    "enableToast": true,
    "enableKeyboardShortcuts": true,
    "enableContextMenu": true,
    "itemsPerPage": 50
  },
  "search": {
    "enabled": true,
    "maxResults": 100,
    "enableHistory": true,
    "historyLimit": 10
  },
  "analytics": {
    "enabled": true,
    "trackPageViews": true,
    "trackFileOperations": true,
    "trackSearches": true,
    "retentionDays": 90
  },
  "supportedFormats": [
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp",
    ".mp4", ".webm", ".ogg", ".mov"
  ]
}
```

### Configuration Sections

#### Server Configuration
```json
{
  "server": {
    "port": 3000,                    // HTTP server port
    "sessionSecret": "...",         // Session encryption key
    "jwtSecret": "...",             // JWT token secret
    "sessionMaxAge": 86400000,      // Session expiry (ms) = 1 day
    "jwtExpiresIn": "7d",           // JWT access token expiry
    "jwtRefreshExpiresIn": "30d",   // JWT refresh token expiry
    "enableCaching": true            // Enable response caching
  }
}
```

#### App Configuration
```json
{
  "apps": {
    "daily-plan": {
      "name": "Daily Plan Viewer",
      "description": "View daily plans",
      "icon": "📅",
      "enabled": true,
      "refreshInterval": 60000,     // Refresh every 60 seconds
      "maxImageSize": 5242880        // Max 5MB per image
    }
  }
}
```

#### Image Processing Configuration
```json
{
  "imageProcessing": {
    "enabled": true,
    "generateThumbnails": true,
    "thumbnailQuality": 80,          // WebP quality (0-100)
    "thumbnailSize": 200,            // Thumbnail dimension (px)
    "optimizeImages": true,
    "maxImageDimension": 4096,       // Max dimension before resize
    "cacheDuration": 86400000        // Cache expiry (ms) = 1 day
  }
}
```

#### File Management Configuration
```json
{
  "fileManagement": {
    "allowDelete": true,
    "allowRename": true,
    "allowMove": true,
    "allowCopy": true,
    "maxFileSize": 1073741824,       // Max 1GB per file
    "allowedFileTypes": []            // Empty = all types allowed
  }
}
```

#### UI Configuration
```json
{
  "ui": {
    "defaultTheme": "dark",
    "enableNotifications": true,
    "enableToast": true,
    "enableKeyboardShortcuts": true,
    "enableContextMenu": true,
    "itemsPerPage": 50               // Pagination limit
  }
}
```

---

## 3. layouts.json Structure

### Layout File Schema
Each layout is stored as a separate JSON file in `data/layouts/` directory.

**File Name**: `layout-{id}-{name}.json`

### Complete Layout Schema
```json
{
  "id": "layout-001",
  "name": "Main Display Layout",
  "description": "Primary layout for main screen",
  "createdBy": "admin",
  "createdAt": "2025-12-01T10:00:00.000Z",
  "updatedAt": "2025-12-12T15:30:00.000Z",
  "assignedTo": ["admin", "manager1"],
  "widgets": [
    {
      "id": "widget-001",
      "type": "image-viewer",
      "position": {
        "x": 0,
        "y": 0,
        "width": 800,
        "height": 600
      },
      "config": {
        "source": "daily-plan",
        "autoRefresh": true,
        "refreshInterval": 60000
      },
      "style": {
        "backgroundColor": "#1a1d29",
        "borderRadius": "12px"
      }
    },
    {
      "id": "widget-002",
      "type": "kpi-card",
      "position": {
        "x": 820,
        "y": 0,
        "width": 400,
        "height": 200
      },
      "config": {
        "title": "Sales",
        "value": "1.2M",
        "trend": "up",
        "imageSource": "Z:\\kpi\\sales.png"
      },
      "style": {
        "backgroundColor": "#2a2a3e",
        "textColor": "#ffffff"
      }
    },
    {
      "id": "widget-003",
      "type": "slideshow",
      "position": {
        "x": 820,
        "y": 220,
        "width": 400,
        "height": 380
      },
      "config": {
        "source": "gallery",
        "interval": 5000,
        "transition": "fade"
      }
    },
    {
      "id": "widget-004",
      "type": "text-display",
      "position": {
        "x": 0,
        "y": 620,
        "width": 1220,
        "height": 100
      },
      "config": {
        "content": "Welcome to Smart Solutions",
        "fontSize": "24px",
        "textAlign": "center"
      }
    }
  ],
  "settings": {
    "backgroundColor": "#1a1d29",
    "gridColumns": 12,
    "gridRows": 8,
    "snapToGrid": true
  }
}
```

### Widget Types and Configurations

#### 1. Image Viewer Widget
```json
{
  "type": "image-viewer",
  "config": {
    "source": "daily-plan|gallery|kpi",
    "autoRefresh": true,
    "refreshInterval": 60000,
    "fitMode": "contain|cover|fill"
  }
}
```

#### 2. KPI Card Widget
```json
{
  "type": "kpi-card",
  "config": {
    "title": "Sales",
    "value": "1.2M",
    "unit": "$",
    "trend": "up|down|stable",
    "imageSource": "path/to/image.png",
    "color": "#667eea"
  }
}
```

#### 3. Slideshow Widget
```json
{
  "type": "slideshow",
  "config": {
    "source": "gallery|folder-path",
    "interval": 5000,
    "transition": "fade|slide|none",
    "shuffle": false
  }
}
```

#### 4. File Browser Widget
```json
{
  "type": "file-browser",
  "config": {
    "rootPath": "Z:\\folder",
    "showThumbnails": true,
    "itemsPerPage": 20
  }
}
```

#### 5. Folder Scanner Widget
```json
{
  "type": "folder-scanner",
  "config": {
    "scanPath": "Z:\\folder",
    "showStats": true,
    "autoRefresh": true
  }
}
```

#### 6. Custom HTML Widget
```json
{
  "type": "custom-html",
  "config": {
    "html": "<div>Custom Content</div>",
    "allowScripts": false
  }
}
```

#### 7. Text Display Widget
```json
{
  "type": "text-display",
  "config": {
    "content": "Text content",
    "fontSize": "16px",
    "textAlign": "left|center|right",
    "color": "#ffffff"
  }
}
```

### Position System
```json
{
  "position": {
    "x": 0,        // X coordinate (pixels or grid units)
    "y": 0,        // Y coordinate (pixels or grid units)
    "width": 800,  // Width (pixels or grid units)
    "height": 600  // Height (pixels or grid units)
  }
}
```

---

## 4. analytics.json Structure

### Schema
```json
{
  "pageViews": [
    {
      "userId": 1,
      "username": "admin",
      "page": "/dashboard",
      "timestamp": "2025-12-12T10:30:00.000Z",
      "duration": 120000
    }
  ],
  "fileOperations": [
    {
      "userId": 1,
      "username": "admin",
      "action": "upload",
      "filePath": "Z:\\images\\photo.jpg",
      "timestamp": "2025-12-12T11:00:00.000Z"
    }
  ],
  "searches": [
    {
      "userId": 1,
      "query": "schedule",
      "results": 5,
      "timestamp": "2025-12-12T11:15:00.000Z"
    }
  ],
  "userActivity": [
    {
      "user": "admin",
      "app": "gallery",
      "action": "view_image",
      "timestamp": "2025-12-12T11:20:00.000Z"
    }
  ]
}
```

---

## Data Relationships

### User → Applications
- One user can access multiple applications
- Controlled by `allowedApps` array
- Role determines default access

### User → Network Paths
- Each user has configured network paths
- Paths are application-specific
- Admin can configure paths per user

### Layout → Widgets
- One layout contains multiple widgets
- Widgets have positions and configurations
- Layouts can be assigned to users

### Analytics → Users
- All analytics entries reference user ID
- Tracks user activity across applications
- Used for reporting and insights

---

## Data Validation Rules

### User Validation
- `id`: Must be unique positive integer
- `username`: 3-50 characters, alphanumeric + underscore/hyphen
- `password`: Must be bcrypt hash (starts with `$2a$`)
- `role`: Must be one of: `admin`, `manager`, `operator`
- `allowedApps`: Array of valid app keys

### Config Validation
- `port`: 1-65535
- `refreshInterval`: Positive integer (milliseconds)
- `maxImageSize`: Positive integer (bytes)
- `thumbnailSize`: 50-500 (pixels)

### Layout Validation
- `id`: Unique identifier string
- `name`: 1-100 characters
- `widgets`: Array of valid widget objects
- `position`: Valid coordinates (non-negative)

---

**Purpose**: This documentation shows how relational data is managed without a SQL database, demonstrating the JSON structure used for users, configuration, layouts, and analytics, proving the system's simplicity and portability.


