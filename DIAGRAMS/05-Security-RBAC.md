# Security Flowchart (RBAC - Role-Based Access Control)

## Authentication and Authorization Flow

```
                    ┌─────────────┐
                    │   START     │
                    │ User Login  │
                    └──────┬──────┘
                           │
                           ▼
              ┌──────────────────────┐
              │  User Enters        │
              │  Username/Password  │
              └──────┬──────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Validate Input      │
         │  - Not Empty         │
         │  - Correct Format    │
         └──────┬───────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Find User in        │
    │  users.json          │
    └───┬───────────────────┘
        │
        ▼
┌───────────────────────┐
│   User Found?         │
└───┬───────────────┬───┘
    │               │
   YES             NO
    │               │
    ▼               ▼
┌──────────┐  ┌──────────────┐
│ Continue │  │ Return Error │
│          │  │ "Invalid     │
│          │  │ Credentials" │
└────┬─────┘  └──────┬───────┘
     │                │
     │                │
     ▼                │
┌─────────────────────┐│
│  bcrypt.compare()   ││
│  Password Hash      ││
│  Verification       ││
└───┬─────────────────┘│
    │                  │
    ▼                  │
┌─────────────────────┐│
│  Password Match?    ││
└───┬─────────────┬───┘│
    │             │    │
   YES           NO    │
    │             │    │
    │             ▼    │
    │      ┌──────────────┐
    │      │ Return Error │
    │      │ "Invalid     │
    │      │ Password"    │
    │      └──────┬───────┘
    │             │
    │             │
    ▼             │
┌─────────────────────┐
│  Create Session     │
│  - Set Session ID   │
│  - Store User ID    │
│  - Set Expiry       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Generate JWT Token │
│  - Access Token     │
│  - Refresh Token    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Check User Role    │
│  from users.json    │
└───┬─────────────────┘
    │
    ▼
┌─────────────────────┐
│   Role Type?        │
└───┬─────────────┬───┘
    │             │
    ▼             ▼             ▼
┌─────────┐  ┌──────────┐  ┌──────────┐
│  ADMIN  │  │ MANAGER  │  │ OPERATOR │
└────┬────┘  └────┬─────┘  └────┬─────┘
     │            │              │
     ▼            ▼              ▼
┌─────────────────────────────────────┐
│         GRANT PERMISSIONS            │
│                                     │
│  ADMIN:                             │
│  ✅ Full System Access              │
│  ✅ User Management                 │
│  ✅ System Settings                 │
│  ✅ Content Management              │
│  ✅ All Applications                │
│  ✅ Monitoring Dashboard            │
│                                     │
│  MANAGER:                           │
│  ✅ Content Management              │
│  ✅ Layout Builder                  │
│  ✅ File Operations                 │
│  ✅ Assigned Applications           │
│  ❌ User Management                 │
│  ❌ System Settings                 │
│                                     │
│  OPERATOR:                          │
│  ✅ View Only Access                │
│  ✅ Assigned Applications           │
│  ❌ Content Modification            │
│  ❌ File Operations                 │
│  ❌ Settings Access                 │
└──────────────┬──────────────────────┘
               │
               ▼
      ┌─────────────────┐
      │  Set Session    │
      │  Cookie         │
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │  Return Success │
      │  + User Data    │
      │  + Tokens       │
      └────────┬────────┘
               │
               ▼
            ┌──────┐
            │ END  │
            └──────┘
```

## Role-Based Access Matrix

| Feature | Admin | Manager | Operator |
|---------|-------|---------|----------|
| **User Management** | ✅ Full | ❌ None | ❌ None |
| **System Settings** | ✅ Full | ❌ None | ❌ None |
| **Layout Builder** | ✅ Full | ✅ Full | ❌ None |
| **Content Management** | ✅ Full | ✅ Full | ❌ None |
| **File Operations** | ✅ Full | ✅ Full | ❌ None |
| **View Applications** | ✅ All | ✅ Assigned | ✅ Assigned |
| **Monitoring Dashboard** | ✅ Full | ❌ None | ❌ None |
| **Backup/Restore** | ✅ Full | ❌ None | ❌ None |
| **Analytics** | ✅ Full | ✅ Limited | ❌ None |

## Security Implementation

### Password Hashing
```javascript
// backend/auth.js
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}
```

### Session Creation
```javascript
// backend/server.js
app.post('/api/login', async (req, res) => {
    const result = await auth.authenticateUser(username, password);
    
    if (result.success) {
        req.session.userId = result.user.id;
        req.session.username = result.user.username;
        req.session.role = result.user.role;
        
        res.json({
            success: true,
            user: result.user,
            token: jwtUtils.generateToken(result.user)
        });
    }
});
```

### Role-Based Middleware
```javascript
// backend/server.js
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        next();
    };
};

// Usage
app.get('/api/admin/users', requireAuth, requireRole(['admin']), (req, res) => {
    // Admin only endpoint
});
```

### Permission Check Function
```javascript
function hasPermission(user, permission) {
    const permissions = {
        admin: ['users', 'settings', 'content', 'layouts', 'monitoring'],
        manager: ['content', 'layouts', 'files'],
        operator: ['view']
    };
    
    return permissions[user.role]?.includes(permission) || false;
}
```

## Security Measures

### 1. Password Security
- **Hashing**: bcrypt with salt rounds (10)
- **Storage**: Never store plain text passwords
- **Validation**: Minimum 6 characters, maximum 200 characters
- **Reset**: Admin can reset passwords securely

### 2. Session Security
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Session Expiry**: 7-30 days (configurable)
- **Secure Flag**: Enabled in production (HTTPS)
- **SameSite**: Lax (CSRF protection)

### 3. JWT Token Security
- **Expiration**: Access token (7 days), Refresh token (30 days)
- **Secret Key**: Stored in config.json (change in production)
- **Verification**: Token signature verification
- **Refresh**: Automatic token refresh mechanism

### 4. Input Validation
- **Sanitization**: All inputs sanitized
- **Type Checking**: Validate data types
- **Length Limits**: Prevent buffer overflow
- **Path Validation**: Prevent directory traversal

### 5. Access Control
- **Role-Based**: Three distinct roles
- **Permission Checks**: Before every sensitive operation
- **Route Protection**: Middleware on all protected routes
- **API Security**: Rate limiting on authentication endpoints

## Authentication Flow Details

### Step 1: Input Validation
- Check username and password are provided
- Validate format (username: 3-50 chars, alphanumeric)
- Validate password length (6-200 chars)

### Step 2: User Lookup
- Search users.json for matching username
- Return error if user not found
- Prevent user enumeration (same error message)

### Step 3: Password Verification
- Retrieve stored password hash
- Use bcrypt.compare() to verify
- Constant-time comparison (prevents timing attacks)

### Step 4: Session Creation
- Generate unique session ID
- Store user ID in session
- Set session expiry time
- Create HTTP-only cookie

### Step 5: Token Generation
- Generate JWT access token
- Generate JWT refresh token
- Include user ID and role in token
- Set expiration times

### Step 6: Role Assignment
- Read user role from users.json
- Assign permissions based on role
- Set allowed applications list
- Configure network paths

### Step 7: Response
- Return success status
- Include user data (without password)
- Include access and refresh tokens
- Set session cookie

## Error Handling

### Invalid Credentials
- Same error message for invalid username/password
- Prevents user enumeration
- Logs failed attempts (for security monitoring)

### Session Expiry
- Automatic session renewal on activity
- Clear session on logout
- Redirect to login on expired session

### Permission Denied
- Clear error message
- Log access attempts
- Return 403 status code

---

**Purpose**: This flowchart demonstrates the security implementation, showing how authentication and authorization work together to provide role-based access control, ensuring users only have access to features appropriate for their role.


