const express = require('express');
const http = require('http');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
const WebSocket = require('ws');
const config = require('../data/config.json');
const auth = require('./auth');
const jwtUtils = require('./utils/jwt');
const dailyPlanRoutes = require('./routes/daily-plan');
const galleryRoutes = require('./routes/gallery');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const server = http.createServer(app);
const PORT = config.server.port || 3000;

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: config.server.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));

const requireAuth = (req, res, next) => {
    let user = null;
    
    if (req.session && req.session.userId) {
        user = auth.getUserById(req.session.userId);
    } else if (req.headers.authorization) {
        const token = req.headers.authorization.replace('Bearer ', '');
        try {
            const decoded = jwtUtils.verifyToken(token);
            user = auth.getUserById(decoded.userId);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    }
    
    if (user) {
        req.user = user;
        return next();
    }
    
    res.status(401).json({ error: 'Authentication required' });
};

app.use(express.static(path.join(__dirname, '../frontend'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Serve cached images and thumbnails
app.use('/data/image-cache', express.static(path.join(__dirname, '../data/image-cache')));
app.use('/data/thumbnails', express.static(path.join(__dirname, '../data/thumbnails')));

app.get('/', (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        const result = await auth.authenticateUser(username, password);
        
        if (!result.success) {
            return res.status(401).json({ error: result.message });
        }
        
        req.session.userId = result.user.id;
        req.session.username = result.user.username;
        req.session.role = result.user.role;
        
        if (rememberMe) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        }
        
        const token = jwtUtils.generateToken(result.user);
        const refreshToken = jwtUtils.generateRefreshToken(result.user);
        
        res.json({
            success: true,
            user: result.user,
            token: token,
            refreshToken: refreshToken,
            expiresIn: jwtUtils.JWT_EXPIRES_IN
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.post('/api/refresh-token', (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }
        
        const decoded = jwtUtils.verifyToken(refreshToken);
        
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        
        const user = auth.getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const newToken = jwtUtils.generateToken(user);
        const newRefreshToken = jwtUtils.generateRefreshToken(user);
        
        res.json({
            success: true,
            token: newToken,
            refreshToken: newRefreshToken,
            expiresIn: jwtUtils.JWT_EXPIRES_IN
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

app.get('/api/verify-token', requireAuth, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});

app.get('/api/current-user', requireAuth, (req, res) => {
    res.json({ user: req.user });
});

app.get('/api/user-preferences', requireAuth, (req, res) => {
    const preferences = auth.getUserPreferences(req.session.userId);
    res.json({ preferences });
});

app.post('/api/user-preferences', requireAuth, (req, res) => {
    const { preferences } = req.body;
    const success = auth.saveUserPreferences(req.session.userId, preferences);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to save preferences' });
    }
});

app.post('/api/update-last-app', requireAuth, (req, res) => {
    const { appName } = req.body;
    const success = auth.updateUserLastApp(req.session.userId, appName);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update last app' });
    }
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/app/:appName', requireAuth, (req, res) => {
    const { appName } = req.params;
    const user = req.user;
    
    if (!user || !user.allowedApps.includes(appName)) {
        return res.status(403).send('Access denied');
    }
    
    const appFiles = {
        'daily-plan': 'daily-plan.html',
        'gallery': 'gallery.html',
        'dashboard': 'dashboard.html',
        'custom-layout': 'custom-layout.html'
    };
    
    const fileName = appFiles[appName];
    if (!fileName) {
        return res.status(404).send('App not found');
    }
    
    res.sendFile(path.join(__dirname, `../frontend/apps/${fileName}`));
});

app.get('/admin', requireAuth, (req, res) => {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.get('/admin/layout-builder', requireAuth, (req, res) => {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    res.sendFile(path.join(__dirname, '../frontend/admin-layout-builder.html'));
});

app.get('/monitoring', requireAuth, (req, res) => {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    res.sendFile(path.join(__dirname, '../frontend/monitoring.html'));
});

app.get('/api/config', requireAuth, (req, res) => {
    res.json({
        apps: config.apps,
        user: {
            role: req.user.role,
            allowedApps: req.user.allowedApps,
            networkPaths: req.user.networkPaths
        }
    });
});

app.use('/api/daily-plan', requireAuth, dailyPlanRoutes.router);
app.use('/api/gallery', requireAuth, galleryRoutes.router);
app.use('/api/dashboard', requireAuth, dashboardRoutes.router);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const layoutRoutes = require('./routes/layouts');
app.use('/api/layouts', layoutRoutes);

const folderScannerRoutes = require('./routes/folder-scanner');
app.use('/api/folder-scanner', folderScannerRoutes);

const imageIntelligenceRoutes = require('./routes/image-intelligence');
app.use('/api/image', imageIntelligenceRoutes);

const searchRoutes = require('./routes/search');
app.use('/api/search', searchRoutes);

const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

const fileManagementRoutes = require('./routes/file-management');
app.use('/api/files', fileManagementRoutes);

const aiFeaturesRoutes = require('./routes/ai-features');
app.use('/api/ai', aiFeaturesRoutes);

const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

const monitoringRoutes = require('./routes/monitoring');
app.use('/api/monitoring', monitoringRoutes);

const backupRoutes = require('./routes/backup');
app.use('/api/backup', backupRoutes);

const systemRoutes = require('./routes/system');
app.use('/api/system', systemRoutes);

const monitoring = require('./utils/monitoring');
const logger = require('./utils/logger');

app.use((req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        monitoring.trackRequest(req.method, req.path, res.statusCode, responseTime);
        
        if (res.statusCode >= 400) {
            logger.warn(`HTTP ${res.statusCode}`, {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                responseTime
            });
        }
    });
    
    next();
});

app.use((err, req, res, next) => {
    logger.error('Unhandled error', err, {
        method: req.method,
        path: req.path,
        body: req.body
    });
    
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const wss = new WebSocket.Server({ 
    server,
    perMessageDeflate: false,
    maxPayload: 1024 * 1024
});

const watchers = new Map();

function setupWatchers() {
    const users = auth.getAllUsers();
    
    users.forEach(user => {
        if (!user.networkPaths) return;
        
        const userId = user.id.toString();
        
        if (user.allowedApps.includes('daily-plan')) {
            let dailyPlanPath;
            if (user.networkPaths.dailyPlan) {
                dailyPlanPath = path.normalize(user.networkPaths.dailyPlan);
            } else if (user.networkPaths.main) {
                dailyPlanPath = path.normalize(user.networkPaths.main);
            } else {
                dailyPlanPath = path.join(__dirname, '../../images');
            }
            
            if (!watchers.has(`${userId}-daily-plan`)) {
                const watcher = dailyPlanRoutes.setupDailyPlanWatcher(dailyPlanPath, wss);
                watchers.set(`${userId}-daily-plan`, watcher);
            }
        }
        
        if (user.allowedApps.includes('gallery')) {
            let galleryPath;
            if (user.networkPaths.gallery) {
                galleryPath = path.normalize(user.networkPaths.gallery);
            } else if (user.networkPaths.main) {
                galleryPath = path.normalize(user.networkPaths.main);
            }
            
            if (galleryPath && !watchers.has(`${userId}-gallery`)) {
                const watcher = galleryRoutes.setupGalleryWatcher(galleryPath, wss);
                watchers.set(`${userId}-gallery`, watcher);
            }
        }
        
        if (user.allowedApps.includes('dashboard')) {
            const mainPath = user.networkPaths.main ? path.normalize(user.networkPaths.main) : null;
            const extraPath = user.networkPaths.extra ? path.normalize(user.networkPaths.extra) : null;
            const kpiPath = user.networkPaths.kpi ? path.normalize(user.networkPaths.kpi) : null;
            
            if (mainPath && !watchers.has(`${userId}-dashboard`)) {
                const watcher = dashboardRoutes.setupDashboardWatcher(mainPath, extraPath, kpiPath, wss);
                watchers.set(`${userId}-dashboard`, watcher);
            }
        }
    });
}

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    let appType = null;
    if (pathname.includes('/daily-plan') || pathname === '/ws/daily-plan') {
        appType = 'daily-plan';
    } else if (pathname.includes('/gallery') || pathname === '/ws/gallery') {
        appType = 'gallery';
    } else if (pathname.includes('/dashboard') || pathname === '/ws/dashboard') {
        appType = 'dashboard';
    } else if (pathname.includes('/monitoring') || pathname === '/ws/monitoring') {
        appType = 'monitoring';
    }
    
    ws.appType = appType;
    ws.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const connectionId = monitoring.trackWebSocketConnection(ws, appType);
    
    console.log(`WebSocket client connected for ${appType || 'unknown'} app (ID: ${connectionId})`);
    
    ws.send(JSON.stringify({ 
        type: 'status', 
        status: 'connected',
        appType: appType,
        connectionId: connectionId
    }));
    
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            } catch (error) {
                monitoring.logError(error, { context: 'WebSocket ping', appType });
                clearInterval(pingInterval);
            }
        } else {
            clearInterval(pingInterval);
        }
    }, 30000);
    
    ws.on('message', (message) => {
        try {
            monitoring.trackWebSocketMessage(ws, 'received');
            const data = JSON.parse(message);
            if (data.type === 'ping') {
                monitoring.trackWebSocketMessage(ws, 'sent');
                ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            } else if (data.type === 'pong') {
                if (ws.monitoringId) {
                    const conn = monitoring.metrics.websockets.connections.find(c => c.id === ws.monitoringId);
                    if (conn) {
                        conn.lastActivity = new Date().toISOString();
                    }
                }
            }
        } catch (error) {
            monitoring.logError(error, { context: 'WebSocket message processing', appType });
            console.error('Error processing WebSocket message:', error);
        }
    });
    
    ws.on('close', () => {
        if (pingInterval) clearInterval(pingInterval);
        monitoring.trackWebSocketDisconnection(ws);
        console.log(`WebSocket client disconnected for ${appType || 'unknown'} app`);
    });
    
    ws.on('error', (error) => {
        monitoring.logError(error, { context: 'WebSocket error', appType });
        console.error(`WebSocket error for ${appType || 'unknown'} app:`, error);
    });
});

const broadcastToMonitoring = (wss, data) => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.appType === 'monitoring') {
            try {
                monitoring.trackWebSocketMessage(client, 'sent');
                client.send(JSON.stringify(data));
            } catch (error) {
                monitoring.logError(error, { context: 'Monitoring broadcast' });
            }
        }
    });
};

setInterval(() => {
    const metrics = monitoring.getMetrics();
    const health = monitoring.getHealthStatus();
    broadcastToMonitoring(wss, {
        type: 'metrics_update',
        metrics: metrics,
        health: health,
        timestamp: new Date().toISOString()
    });
}, 5000);

// Serve 404 page for unknown routes
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
        return;
    }
    if (req.accepts('json')) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.type('txt').send('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
    logger.info(`Smart Solutions Server running on http://localhost:${PORT}`);
    console.log(`Smart Solutions by TripleA running on http://localhost:${PORT}`);
    console.log('Applications available:');
    Object.keys(config.apps).forEach(appKey => {
        console.log(`  - ${config.apps[appKey].name} (/app/${appKey})`);
    });
    console.log(`  - Monitoring Dashboard (/monitoring)`);
    
    setupWatchers();
    logger.info('File watchers initialized');
    console.log('File watchers initialized');
    
    const users = auth.getAllUsers();
    monitoring.updateUserMetrics(users);
    logger.info('Monitoring system initialized');
    console.log('Monitoring system initialized');
    
    logger.info('Server startup complete', {
        port: PORT,
        apps: Object.keys(config.apps).length,
        users: users.length
    });
});