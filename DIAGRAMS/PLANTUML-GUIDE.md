# PlantUML Diagrams Guide - Smart Solutions by TripleA

## Overview

This guide contains **all 9 PlantUML diagrams** ready to use in [PlantText.com](https://www.planttext.com/) for your bachelor project report. Each diagram is professionally formatted and accurately represents your Smart Solutions software architecture.

---

## How to Use

### Step 1: Open PlantText
1. Go to: https://www.planttext.com/
2. Sign up for a free account (optional, but recommended for saving)

### Step 2: Copy Diagram Code
1. Open `PLANTUML-DIAGRAMS.puml` file
2. Copy the code for the diagram you want (each diagram starts with `@startuml` and ends with `@enduml`)
3. Paste into PlantText editor

### Step 3: Generate Diagram
1. Click "Refresh" button (or press Alt+Enter on Windows, Cmd+Enter on Mac)
2. Wait for diagram to render
3. Preview the diagram

### Step 4: Export Diagram
1. Click "PNG" or "SVG" button
2. Download the diagram image
3. Include in your bachelor project report

---

## Diagram List

### 1. High-Level Architecture Diagram
**Purpose**: Shows the "Big Picture" of how hardware and software interact.

**PlantUML Code**: Copy section starting with `@startuml Diagram-01-High-Level-Architecture`

**What It Shows**:
- Hardware Layer (Raspberry Pi, HDMI Screen, USB Drive)
- Software Layer (Node.js Server, Express.js, WebSocket, Chokidar)
- Data Source Layer (Network Drive)
- User Interface Layer (Client Browser)

**Use For**: Section 4.1 - System Architecture Overview

---

### 2. Software Stack Diagram (Layered Architecture)
**Purpose**: Visualizes the specific technologies used at each layer.

**PlantUML Code**: Copy section starting with `@startuml Diagram-02-Software-Stack`

**What It Shows**:
- Presentation Layer (HTML5, CSS3, Vanilla JS, WebSocket Client, Fetch API)
- Application Layer (Express.js, WebSocket Server, Chokidar, Multer, Compression, Helmet, Rate Limit, Session)
- Logic Layer (Sharp, Canvas, Tesseract.js, bcryptjs, JWT, AI Analyzer, Validator, Logger, Monitoring)
- Data Layer (JSON Storage, File System, Image Cache)

**Use For**: Section 4.2 - Technology Stack

---

### 3. Sequence Diagram: Real-Time File Update
**Purpose**: Proves understanding of event-driven architecture (core innovation).

**PlantUML Code**: Copy section starting with `@startuml Diagram-03-Sequence-Real-Time-Update`

**What It Shows**:
- User adds file to Network Drive
- Chokidar detects 'add' event
- Node.js Controller processes file
- Sharp optimizes image & creates thumbnail
- WebSocket Server broadcasts update
- Frontend updates DOM instantly

**Use For**: Section 4.3 - Real-Time Update Mechanism

---

### 4. Activity Diagram: Smart Image Optimization
**Purpose**: Explains performance optimization strategy for low-power Pi.

**PlantUML Code**: Copy section starting with `@startuml Diagram-04-Activity-Image-Optimization`

**What It Shows**:
- File type check
- Dimension analysis
- Resize decision (if > 1080p)
- Format conversion (to WebP)
- Thumbnail generation
- Cache management

**Use For**: Section 4.4 - Performance Optimization Strategy

---

### 5. Security Flowchart (RBAC)
**Purpose**: Demonstrates security implementation.

**PlantUML Code**: Copy section starting with `@startuml Diagram-05-Security-RBAC`

**What It Shows**:
- Login input validation
- Password hash verification (bcrypt)
- Session creation
- JWT token generation
- Role-based access control (Admin/Manager/Operator)
- Permission assignment

**Use For**: Section 4.5 - Security Implementation

---

### 6. Data Schema Documentation (JSON Structure)
**Purpose**: Shows how relational data is managed without SQL database.

**PlantUML Code**: Copy section starting with `@startuml Diagram-06-Data-Schema`

**What It Shows**:
- users.json structure (User class)
- config.json structure (ServerConfig, AppConfig, ImageProcessingConfig)
- layouts/*.json structure (Layout, Widget, Position classes)
- analytics.json structure (Analytics class)
- Relationships between data structures

**Use For**: Section 4.6 - Data Storage Architecture

---

### 7. UI/UX Sitemap
**Purpose**: Shows user journey through the application.

**PlantUML Code**: Copy section starting with `@startuml Diagram-07-UI-Sitemap`

**What It Shows**:
- Login Page
- Dashboard (Main App Selector)
- Daily Plan Viewer (Morning/Evening/Night)
- Image Gallery (Browse/Slideshow/Meeting modes)
- Performance Dashboard (KPI Cards)
- Admin Panel (User Management, Settings, Layout Builder, Monitoring)
- Global Features (Search, Theme, Shortcuts, Notifications)

**Use For**: Section 4.7 - User Interface Design

---

### 8. Deployment Diagram
**Purpose**: Shows how the standalone application is deployed in the real world.

**PlantUML Code**: Copy section starting with `@startuml Diagram-08-Deployment`

**What It Shows**:
- Network Drive structure (Z: drive)
- Raspberry Pi Zero 2 W setup
- Network drive mapping
- Node.js runtime
- Application server
- Startup script
- Browser kiosk mode
- HDMI screen connection

**Use For**: Section 4.8 - Deployment Architecture

---

### 9. Code Snippets (Key Algorithms)
**Purpose**: Proof of code quality (for Appendix E).

**PlantUML Code**: Copy section starting with `@startuml Diagram-09-Code-Snippets`

**What It Shows**:
- Chokidar Watcher Configuration class
- Sharp Image Resizing class
- WebSocket Broadcast class
- Authentication Middleware class
- Rate Limiting class
- Relationships between components

**Use For**: Appendix E - Code Examples

---

## Tips for Best Results

### 1. Export Settings
- **PNG**: Best for documents (Word, PDF)
- **SVG**: Best for scalable graphics (can resize without quality loss)
- **PDF**: Best for printing

### 2. Diagram Size
- PlantText automatically sizes diagrams
- Use "Scale" slider to adjust size before export
- Larger diagrams = better quality but larger file size

### 3. Theme Customization
- PlantText supports multiple themes
- Click "Diagram Theme" dropdown to change
- Recommended: "Plain" (default) or "AWS Orange" for professional look

### 4. Editing Diagrams
- You can edit PlantUML code directly in PlantText
- Changes are reflected immediately on refresh
- Save your work using "Save file" button

### 5. Sharing Diagrams
- Use "Share" button to generate shareable link
- Use "Send to Email" to email diagram to yourself
- Use "Link Maker" to create embeddable URL

---

## Quick Reference: All Diagrams

| # | Diagram Name | PlantUML Tag | Use For |
|---|-------------|--------------|---------|
| 1 | High-Level Architecture | `Diagram-01-High-Level-Architecture` | Section 4.1 |
| 2 | Software Stack | `Diagram-02-Software-Stack` | Section 4.2 |
| 3 | Sequence: Real-Time Update | `Diagram-03-Sequence-Real-Time-Update` | Section 4.3 |
| 4 | Activity: Image Optimization | `Diagram-04-Activity-Image-Optimization` | Section 4.4 |
| 5 | Security Flowchart (RBAC) | `Diagram-05-Security-RBAC` | Section 4.5 |
| 6 | Data Schema | `Diagram-06-Data-Schema` | Section 4.6 |
| 7 | UI/UX Sitemap | `Diagram-07-UI-Sitemap` | Section 4.7 |
| 8 | Deployment Diagram | `Diagram-08-Deployment` | Section 4.8 |
| 9 | Code Snippets | `Diagram-09-Code-Snippets` | Appendix E |

---

## Example Workflow

1. **Open PlantText**: https://www.planttext.com/
2. **Copy Diagram 1**: From `PLANTUML-DIAGRAMS.puml`, copy `@startuml Diagram-01-High-Level-Architecture` to `@enduml`
3. **Paste**: Into PlantText editor
4. **Refresh**: Click refresh button (Alt+Enter)
5. **Preview**: Check diagram looks correct
6. **Export**: Click "PNG" button, download
7. **Repeat**: For all 9 diagrams

---

## Troubleshooting

### Diagram Not Rendering?
- Check PlantUML syntax (all `@startuml` tags have matching `@enduml`)
- Ensure no syntax errors (PlantText will highlight errors)
- Try refreshing again

### Diagram Too Small/Large?
- Use "Scale" slider to adjust size
- Export as SVG for scalable graphics
- Use "Popout" button for larger view

### Want to Customize Colors?
- Edit PlantUML code directly
- Add `skinparam` commands for custom colors
- See PlantUML documentation for color options

---

## Additional Resources

- **PlantText Website**: https://www.planttext.com/
- **PlantUML Documentation**: http://plantuml.com/
- **PlantUML Syntax Guide**: http://plantuml.com/guide

---

## Summary

All 9 diagrams are ready to use! Simply:
1. Copy the PlantUML code from `PLANTUML-DIAGRAMS.puml`
2. Paste into PlantText.com
3. Export as PNG/SVG
4. Include in your bachelor project report

**Good luck with your bachelor project!** 🎓


