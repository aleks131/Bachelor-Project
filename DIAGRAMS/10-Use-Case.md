# Use Case Diagram

## Overview

This diagram illustrates the different user roles (Admin, Manager, Operator) and their respective access levels and capabilities within the Smart Solutions platform.

## User Roles

### Admin Role
**Full System Access**
- ✅ User Management (Create, Edit, Delete users)
- ✅ System Configuration (Port, Paths, Security settings)
- ✅ Monitoring Dashboard (System Health, Metrics)
- ✅ Custom Layout Creation (Layout Builder)
- ✅ Network Path Management
- ✅ Backup & Restore System
- ✅ All Content Management features
- ✅ All Applications access

### Manager Role
**Content Management Access**
- ✅ View Daily Plans
- ✅ Browse Image Gallery
- ✅ View Performance KPIs
- ✅ Upload Files
- ✅ Organize Content (Copy, Move, Delete)
- ✅ View Assigned Content
- ✅ Use Global Search
- ✅ Access User Guide
- ❌ User Management
- ❌ System Settings

### Operator Role
**View-Only Access**
- ✅ View Daily Plans
- ✅ View Assigned Content
- ✅ Use Global Search (Ctrl+K)
- ✅ Access User Guide
- ❌ Content Modification
- ❌ File Operations
- ❌ Settings Access

## Use Cases

### System Management (Admin Only)
1. **Manage Users**: Create, edit, and delete user accounts
2. **Configure System Settings**: Port configuration, security settings
3. **Access Monitoring Dashboard**: System health and performance metrics
4. **Backup & Restore**: System data management

### Content Management (Admin & Manager)
5. **Upload Files**: Add new content to the system
6. **Organize Content**: Copy, move, and delete files
7. **Create Custom Layouts**: Design custom dashboard layouts

### Content Viewing (All Roles)
8. **View Daily Plans**: Time-based schedule viewing
9. **Browse Image Gallery**: Image and video browsing
10. **View Performance KPIs**: Dashboard display

### General Features (All Roles)
11. **Use Global Search**: Quick content search (Ctrl+K)
12. **Access User Guide**: System documentation

## Role-Based Access Matrix

| Feature | Admin | Manager | Operator |
|---------|-------|---------|----------|
| User Management | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ |
| Monitoring | ✅ | ❌ | ❌ |
| Layout Builder | ✅ | ✅ | ❌ |
| Upload Files | ✅ | ✅ | ❌ |
| Organize Content | ✅ | ✅ | ❌ |
| View Content | ✅ | ✅ | ✅ |
| Global Search | ✅ | ✅ | ✅ |
| User Guide | ✅ | ✅ | ✅ |

## Diagram Location

**PlantUML File**: `DIAGRAMS/PLANTUML-DIAGRAMS.puml`  
**Diagram ID**: `Diagram-10-Use-Case`

To render this diagram:
1. Open `PLANTUML-DIAGRAMS.puml`
2. Find `@startuml Diagram-10-Use-Case`
3. Copy the entire diagram block (until `@enduml`)
4. Paste into PlantText.com
5. Export as PNG/SVG

---

**Purpose**: This diagram clearly shows the scope of access for Admin vs. Operator (and Manager) roles, demonstrating the role-based access control (RBAC) system implemented in the platform.

