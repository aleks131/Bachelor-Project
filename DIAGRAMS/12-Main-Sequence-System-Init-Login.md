# Main Sequence Diagram: System Initialization & Login Flow

## Overview

This diagram shows the complete sequence of events from system startup through user authentication and dashboard access, demonstrating the initialization process and login flow.

## Sequence Flow

### Phase 1: System Initialization

**Steps**:
1. **Initialize File Watchers**
   - Setup Chokidar for each user path
   - Register watcher events with WebSocket server

2. **Initialize WebSocket Server**
   - Start on port 3000
   - Setup connection handlers
   - Prepare for real-time communication

3. **Load Configuration**
   - Read `config.json`
   - Setup Express middleware
   - Register API routes

4. **Start HTTP Server**
   - Listen on port 3000
   - Server ready for requests

**Server Ready State**:
- ✅ HTTP: Port 3000
- ✅ WebSocket: Port 3000
- ✅ File watchers active
- ✅ Routes registered

### Phase 2: User Login Flow

**Step-by-Step Process**:

1. **User Navigation**
   - User navigates to `/` (Login Page)
   - Browser requests `GET /`
   - Server serves `login.html`

2. **Credential Submission**
   - User enters username and password
   - Browser sends `POST /api/login` with credentials

3. **Authentication Process**
   - Server calls `authenticateUser(username, password)`
   - Auth module reads `users.json`
   - Password verification using `bcrypt.compare()`

4. **Success Path** (Password Valid):
   - Create session (Set `session.userId`)
   - Store session data (Expiry: 7-30 days)
   - Generate JWT tokens:
     - Access token (expires in 1h)
     - Refresh token (expires in 7d)
   - Return success response with user data and tokens

5. **Dashboard Access**
   - Browser stores token and redirects to `/dashboard`
   - Browser requests `GET /dashboard` with session cookie
   - `requireAuth` middleware validates session
   - Check `session.userId` from session store
   - Get user data from `users.json`
   - Set `req.user` for request
   - Serve `dashboard.html`
   - Browser requests `/api/config`
   - Server returns app configuration
   - Browser renders dashboard with user apps

6. **Failure Path** (Password Invalid):
   - Return error: "Invalid credentials"
   - Browser shows error message
   - User remains on login page

## Security Features

### Authentication Mechanisms
- **Session-Based**: HTTP-only cookies, secure session storage
- **JWT Tokens**: Access and refresh tokens for API authentication
- **Password Hashing**: bcrypt with 10 rounds
- **Session Expiry**: Configurable (7-30 days)

### Access Control
- **Role-Based**: User role checked from `users.json`
- **Middleware Protection**: `requireAuth` validates all protected routes
- **Token Expiration**: Automatic token refresh mechanism

## Components Involved

1. **Browser**: Client-side interface
2. **Express Server**: Main application server
3. **Session Store**: Session data storage
4. **Auth Module**: Authentication logic
5. **users.json**: User database (JSON file)
6. **JWT Utils**: Token generation and validation
7. **File Watchers**: Background file monitoring
8. **WebSocket Server**: Real-time communication

## Error Handling

### Invalid Credentials
- Returns 401 Unauthorized
- Error message displayed to user
- No session created
- User remains on login page

### Session Validation
- Middleware checks session on each request
- Invalid/expired sessions redirect to login
- Automatic cleanup of expired sessions

## Diagram Location

**PlantUML File**: `DIAGRAMS/PLANTUML-DIAGRAMS.puml`  
**Diagram ID**: `Diagram-12-Main-Sequence-System-Init-Login`

To render this diagram:
1. Open `PLANTUML-DIAGRAMS.puml`
2. Find `@startuml Diagram-12-Main-Sequence-System-Init-Login`
3. Copy the entire diagram block (until `@enduml`)
4. Paste into PlantText.com
5. Export as PNG/SVG

---

**Purpose**: This diagram shows the complete system initialization process and login flow, demonstrating how the system starts up, how users authenticate, and how role-based access is enforced throughout the application.

