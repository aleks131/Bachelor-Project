# Software Stack Diagram (Layered Architecture)

## Complete Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (Frontend)                        │
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │     HTML5        │  │      CSS3        │  │  Vanilla JS      │     │
│  │  - Semantic      │  │  - Grid/Flexbox   │  │  - ES6+          │     │
│  │  - Forms         │  │  - Variables     │  │  - Classes       │     │
│  │  - LocalStorage  │  │  - Animations    │  │  - Async/Await   │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │         WebSocket Client API                                  │       │
│  │  - Real-time Communication                                   │       │
│  │  - Event Handling                                            │       │
│  │  - Auto-reconnection                                         │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │         Fetch API                                             │       │
│  │  - REST API Calls                                            │       │
│  │  - JSON Data Transport                                       │       │
│  └──────────────────────────────────────────────────────────────┘       │
└───────────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              │
┌─────────────────────────────▼───────────────────────────────────────────┐
│                 APPLICATION LAYER (Backend)                              │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │         Express.js Framework                                 │        │
│  │  - REST API Endpoints                                        │        │
│  │  - Static File Serving                                       │        │
│  │  - Middleware Pipeline                                       │        │
│  │  - Session Management                                        │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │         WebSocket Server (ws)                                 │        │
│  │  - Real-time Bi-directional Communication                    │        │
│  │  - Connection Management                                     │        │
│  │  - Message Broadcasting                                      │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │         Chokidar (File Watcher)                              │        │
│  │  - Event-Driven File System Monitoring                      │        │
│  │  - Network Drive Watching                                   │        │
│  │  - Change Detection                                         │        │
│  └──────────────────────────────────────────────────────────────┘        │
└───────────────────────────────────────────────────────────────────────────┘
                              │
                              │ Function Calls
                              │
┌─────────────────────────────▼───────────────────────────────────────────┐
│                      LOGIC LAYER (Business Logic)                        │
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │      Sharp       │  │     Canvas       │  │  Auth Middleware  │     │
│  │  - Image Resize │  │  - Image Analysis│  │  - Session Check  │     │
│  │  - Format Conv. │  │  - Color Extract │  │  - JWT Verify     │     │
│  │  - Thumbnails   │  │  - Hash Generate │  │  - Role Check     │     │
│  │  - Optimization │  │  - Duplicate Det.│  │  - Path Validation│     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │         Tesseract.js (OCR)                                    │       │
│  │  - Text Extraction from Images                               │       │
│  │  - Language Detection                                        │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │         bcryptjs (Security)                                  │       │
│  │  - Password Hashing                                          │       │
│  │  - Salt Generation                                          │       │
│  └──────────────────────────────────────────────────────────────┘       │
└───────────────────────────────────────────────────────────────────────────┘
                              │
                              │ File I/O
                              │
┌─────────────────────────────▼───────────────────────────────────────────┐
│                        DATA LAYER (Storage)                              │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │         JSON Storage (Flat Files)                            │        │
│  │  - users.json (User Accounts)                               │        │
│  │  - config.json (System Configuration)                       │        │
│  │  - layouts/*.json (Custom Layouts)                          │        │
│  │  - analytics.json (Usage Analytics)                         │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │         File System (Network Drive)                          │        │
│  │  - Content Files (Images, Videos, Documents)                │        │
│  │  - Schedule Files                                           │        │
│  │  - KPI Data Files                                           │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │         Image Cache                                          │        │
│  │  - data/image-cache/ (Optimized Images)                     │        │
│  │  - data/thumbnails/ (Thumbnail Images)                      │        │
│  │  - data/ai-cache/ (AI Analysis Results)                     │        │
│  └──────────────────────────────────────────────────────────────┘        │
└───────────────────────────────────────────────────────────────────────────┘
```

## Layer Details

### Presentation Layer Technologies

**HTML5**
- Semantic elements (`<header>`, `<main>`, `<section>`)
- Form validation
- LocalStorage API
- WebSocket API
- Fetch API

**CSS3**
- CSS Grid & Flexbox for layouts
- CSS Variables for theming
- Animations and transitions
- Dark mode support
- Responsive design (media queries)

**Vanilla JavaScript (ES6+)**
- Classes and modules
- Async/await for asynchronous operations
- Arrow functions
- Template literals
- Destructuring
- Spread operator

### Application Layer Technologies

**Express.js**
- RESTful API routing
- Middleware pipeline
- Static file serving
- Session management
- Error handling

**WebSocket (ws)**
- Real-time bi-directional communication
- Connection management
- Message broadcasting
- Ping/pong keep-alive

**Chokidar**
- Event-driven file watching
- Cross-platform compatibility
- Efficient resource usage
- Network drive support

### Logic Layer Technologies

**Sharp**
- High-performance image processing
- Format conversion (PNG → WebP)
- Resizing and optimization
- Thumbnail generation

**Canvas**
- Image analysis
- Color extraction
- Perceptual hashing
- Duplicate detection

**Tesseract.js**
- OCR text extraction
- Multi-language support
- Offline processing

**bcryptjs**
- Password hashing with salt
- Secure password storage
- Password verification

### Data Layer Technologies

**JSON Files**
- Human-readable format
- Easy backup/restore
- No database server required
- Fast read/write operations

**File System**
- Direct network drive access
- File operations (read, write, delete)
- Directory traversal
- Metadata access

**Image Cache**
- Optimized image storage
- Thumbnail cache
- AI analysis cache
- Performance optimization

## Technology Choices Rationale

### Why Vanilla JavaScript?
- **Performance**: No framework overhead
- **Compatibility**: Works on low-power devices (Raspberry Pi)
- **Size**: Smaller bundle size
- **Control**: Direct DOM manipulation

### Why Express.js?
- **Mature**: Well-established framework
- **Flexible**: Easy to extend
- **Performance**: Fast and efficient
- **Ecosystem**: Large package ecosystem

### Why Chokidar?
- **Efficiency**: More efficient than polling
- **Cross-platform**: Works on Windows, Linux, macOS
- **Event-driven**: Reacts instantly to changes
- **Low resource usage**: Important for Raspberry Pi

### Why Sharp?
- **Performance**: Fast image processing
- **Memory efficient**: Low memory footprint
- **Format support**: Supports many formats
- **Optimization**: Automatic optimization

### Why JSON Files?
- **Simplicity**: No database server needed
- **Portability**: Easy to backup and move
- **Human-readable**: Can be edited manually
- **Fast**: Direct file I/O is fast for small datasets

---

**Purpose**: This diagram visualizes the specific technologies used at each layer, demonstrating the complete technology stack and how each component contributes to the system's functionality.


