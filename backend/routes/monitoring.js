const express = require('express');
const router = express.Router();
const monitoring = require('../utils/monitoring');
const auth = require('../auth');
const fs = require('fs');
const path = require('path');

const requireAdmin = (req, res, next) => {
    if (req.session && req.session.userId) {
        const user = auth.getUserById(req.session.userId);
        if (user && user.role === 'admin') {
            req.user = user;
            return next();
        }
    }
    res.status(403).json({ error: 'Admin access required' });
};

router.get('/metrics', requireAdmin, (req, res) => {
    try {
        const metrics = monitoring.getMetrics();
        res.json(metrics);
    } catch (error) {
        console.error('Error getting metrics:', error);
        res.status(500).json({ error: 'Failed to get metrics' });
    }
});

router.get('/health', requireAdmin, (req, res) => {
    try {
        const health = monitoring.getHealthStatus();
        res.json(health);
    } catch (error) {
        console.error('Error getting health status:', error);
        res.status(500).json({ error: 'Failed to get health status' });
    }
});

router.get('/errors', requireAdmin, (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const errors = monitoring.getErrorLog(limit);
        res.json({ errors, count: errors.length });
    } catch (error) {
        console.error('Error getting error log:', error);
        res.status(500).json({ error: 'Failed to get error log' });
    }
});

router.get('/system', requireAdmin, (req, res) => {
    try {
        const metrics = monitoring.getMetrics();
        res.json({
            system: metrics.system,
            uptime: metrics.system.uptime,
            startTime: new Date(metrics.startTime).toISOString(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting system info:', error);
        res.status(500).json({ error: 'Failed to get system info' });
    }
});

router.get('/performance', requireAdmin, (req, res) => {
    try {
        const metrics = monitoring.getMetrics();
        res.json({
            performance: metrics.performance,
            requests: {
                total: metrics.requests.total,
                errors: metrics.requests.errors,
                success: metrics.requests.success,
                errorRate: metrics.requests.total > 0 
                    ? ((metrics.requests.errors / metrics.requests.total) * 100).toFixed(2) + '%'
                    : '0%'
            },
            topEndpoints: Object.entries(metrics.requests.byEndpoint)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 10)
                .map(([endpoint, data]) => ({
                    endpoint,
                    count: data.count,
                    errors: data.errors,
                    averageTime: data.averageTime
                }))
        });
    } catch (error) {
        console.error('Error getting performance data:', error);
        res.status(500).json({ error: 'Failed to get performance data' });
    }
});

router.get('/websockets', requireAdmin, (req, res) => {
    try {
        const metrics = monitoring.getMetrics();
        res.json({
            websockets: metrics.websockets,
            connections: metrics.websockets.connections.map(conn => ({
                id: conn.id,
                appType: conn.appType,
                connectedAt: conn.connectedAt,
                lastActivity: conn.lastActivity,
                messagesSent: conn.messagesSent,
                messagesReceived: conn.messagesReceived,
                duration: Math.round((Date.now() - new Date(conn.connectedAt).getTime()) / 1000)
            }))
        });
    } catch (error) {
        console.error('Error getting WebSocket data:', error);
        res.status(500).json({ error: 'Failed to get WebSocket data' });
    }
});

router.get('/file-watchers', requireAdmin, (req, res) => {
    try {
        const metrics = monitoring.getMetrics();
        res.json({
            fileWatchers: metrics.fileWatchers,
            paths: metrics.fileWatchers.paths.map(p => ({
                path: p,
                exists: fs.existsSync(p),
                accessible: (() => {
                    try {
                        fs.accessSync(p, fs.constants.R_OK);
                        return true;
                    } catch {
                        return false;
                    }
                })()
            }))
        });
    } catch (error) {
        console.error('Error getting file watcher data:', error);
        res.status(500).json({ error: 'Failed to get file watcher data' });
    }
});

router.get('/users', requireAdmin, (req, res) => {
    try {
        const users = auth.getAllUsers();
        monitoring.updateUserMetrics(users);
        const metrics = monitoring.getMetrics();
        
        res.json({
            users: {
                total: metrics.users.total,
                active: metrics.users.active,
                byRole: metrics.users.byRole,
                list: users.map(u => ({
                    id: u.id,
                    username: u.username,
                    role: u.role,
                    allowedApps: u.allowedApps,
                    networkPaths: Object.keys(u.networkPaths || {})
                }))
            }
        });
    } catch (error) {
        console.error('Error getting user data:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

router.post('/reset', requireAdmin, (req, res) => {
    try {
        monitoring.resetMetrics();
        res.json({ success: true, message: 'Metrics reset successfully' });
    } catch (error) {
        console.error('Error resetting metrics:', error);
        res.status(500).json({ error: 'Failed to reset metrics' });
    }
});

router.get('/summary', requireAdmin, (req, res) => {
    try {
        const metrics = monitoring.getMetrics();
        const health = monitoring.getHealthStatus();
        
        res.json({
            health: health.status,
            uptime: Math.round((Date.now() - metrics.startTime) / 1000),
            requests: {
                total: metrics.requests.total,
                errors: metrics.requests.errors,
                success: metrics.requests.success,
                errorRate: metrics.requests.total > 0 
                    ? ((metrics.requests.errors / metrics.requests.total) * 100).toFixed(2) + '%'
                    : '0%'
            },
            websockets: {
                active: metrics.websockets.activeConnections,
                total: metrics.websockets.totalConnections
            },
            fileWatchers: {
                active: metrics.fileWatchers.active
            },
            system: {
                memory: `${metrics.system.memory.used}MB / ${metrics.system.memory.total}MB (${metrics.system.memory.percentage}%)`,
                cpu: `${metrics.system.cpu.usage}%`,
                uptime: `${Math.round(metrics.system.uptime / 60)} minutes`
            },
            users: {
                total: metrics.users.total,
                byRole: metrics.users.byRole
            },
            errors: {
                recent: metrics.errors.length,
                total: monitoring.getErrorLog().length
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting summary:', error);
        res.status(500).json({ error: 'Failed to get summary' });
    }
});

module.exports = router;




