# Smart Solutions by TripleA

Enterprise-grade unified application platform for managing daily operations, image galleries, and performance dashboards.

## 🚀 Features

- **Daily Plan Viewer** - Time-based schedule management with automatic shift detection
- **Image Gallery** - Browse, slideshow, and meeting modes with advanced image tools
- **Performance Dashboard** - KPI tracking and visualization with drag-and-drop customization
- **Admin Panel** - Complete user and system management
- **AI Features** - OCR text extraction, color analysis, duplicate detection
- **Real-Time Updates** - WebSocket-based live synchronization
- **Dark Mode** - Beautiful light/dark theme toggle

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, WebSocket
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Image Processing**: Sharp, Canvas
- **AI**: Tesseract.js (OCR)
- **Authentication**: Session-based + JWT tokens
- **Storage**: JSON flat-files

## 📦 Installation

```bash
# Install dependencies
npm install

# Initialize admin user
node backend/init-admin.js

# Start server
npm start
```

Or use the batch files:
- `SETUP.bat` - First-time setup (install dependencies, create admin user)
- `START.bat` - Start the software (daily use)

## 🔐 Default Login

- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Change the default password after first login!**

## 📖 Documentation

- `HOW-TO-RUN-AND-TEST.md` - Complete testing guide
- `BATCH-FILES-GUIDE.md` - Batch file reference

## 🎯 Requirements

- Node.js v14+ (recommended v18+)
- Windows, Linux (Raspberry Pi), or macOS
- Modern web browser

## 📝 License

ISC

## 👨‍💻 Author

TripleA

---

**Version**: 2.0.0  
**Status**: ✅ Production Ready

## 🆕 Latest Updates (v2.0.0)

- ✅ **Security**: Rate limiting, security headers, input validation
- ✅ **Performance**: Gzip compression, smart caching, optimized requests
- ✅ **PWA**: Installable as standalone app, offline support
- ✅ **Mobile**: Full responsive design, touch-optimized
- ✅ **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation
