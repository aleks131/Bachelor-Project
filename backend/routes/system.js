const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const os = require('os');
const auth = require('../auth');
const logger = require('../utils/logger');
const validator = require('../utils/validator');

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

router.get('/diagnostics', requireAdmin, (req, res) => {
    try {
        const diagnostics = {
            timestamp: new Date().toISOString(),
            system: {
                platform: os.platform(),
                arch: os.arch(),
                nodeVersion: process.version,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: os.cpus().length
            },
            application: {
                version: '2.0.0',
                dataDir: path.join(__dirname, '../../data'),
                logDir: path.join(__dirname, '../../data/logs')
            },
            checks: []
        };
        
        const dataDir = path.join(__dirname, '../../data');
        diagnostics.checks.push({
            name: 'Data Directory',
            status: fs.existsSync(dataDir) ? 'ok' : 'error',
            message: fs.existsSync(dataDir) ? 'Exists' : 'Missing'
        });
        
        const usersFile = path.join(dataDir, 'users.json');
        diagnostics.checks.push({
            name: 'Users File',
            status: fs.existsSync(usersFile) ? 'ok' : 'warning',
            message: fs.existsSync(usersFile) ? 'Exists' : 'Missing'
        });
        
        const configFile = path.join(dataDir, 'config.json');
        diagnostics.checks.push({
            name: 'Config File',
            status: fs.existsSync(configFile) ? 'ok' : 'error',
            message: fs.existsSync(configFile) ? 'Exists' : 'Missing'
        });
        
        const logsDir = path.join(dataDir, 'logs');
        diagnostics.checks.push({
            name: 'Logs Directory',
            status: fs.existsSync(logsDir) ? 'ok' : 'warning',
            message: fs.existsSync(logsDir) ? 'Exists' : 'Missing'
        });
        
        const backupsDir = path.join(dataDir, 'backups');
        diagnostics.checks.push({
            name: 'Backups Directory',
            status: fs.existsSync(backupsDir) ? 'ok' : 'warning',
            message: fs.existsSync(backupsDir) ? 'Exists' : 'Missing'
        });
        
        try {
            const users = auth.getAllUsers();
            diagnostics.checks.push({
                name: 'User Data',
                status: users.length > 0 ? 'ok' : 'warning',
                message: `${users.length} users found`
            });
        } catch (error) {
            diagnostics.checks.push({
                name: 'User Data',
                status: 'error',
                message: error.message
            });
        }
        
        res.json(diagnostics);
    } catch (error) {
        logger.error('Error getting diagnostics', error);
        res.status(500).json({ error: 'Failed to get diagnostics' });
    }
});

router.get('/health-check', requireAdmin, (req, res) => {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            checks: []
        };
        
        const memUsage = process.memoryUsage();
        const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        health.checks.push({
            name: 'Memory',
            status: memPercent > 90 ? 'critical' : memPercent > 75 ? 'warning' : 'ok',
            value: `${Math.round(memPercent)}%`,
            details: {
                used: Math.round(memUsage.heapUsed / 1024 / 1024),
                total: Math.round(memUsage.heapTotal / 1024 / 1024)
            }
        });
        
        const dataDir = path.join(__dirname, '../../data');
        health.checks.push({
            name: 'Data Directory',
            status: fs.existsSync(dataDir) ? 'ok' : 'error',
            value: fs.existsSync(dataDir) ? 'Accessible' : 'Not Found'
        });
        
        const usersFile = path.join(dataDir, 'users.json');
        health.checks.push({
            name: 'Users File',
            status: fs.existsSync(usersFile) ? 'ok' : 'error',
            value: fs.existsSync(usersFile) ? 'Exists' : 'Missing'
        });
        
        const criticalChecks = health.checks.filter(c => c.status === 'error' || c.status === 'critical');
        if (criticalChecks.length > 0) {
            health.status = 'unhealthy';
        } else {
            const warnings = health.checks.filter(c => c.status === 'warning');
            if (warnings.length > 0) {
                health.status = 'degraded';
            }
        }
        
        res.json(health);
    } catch (error) {
        logger.error('Error performing health check', error);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

router.post('/validate', requireAdmin, (req, res) => {
    try {
        const { type, data } = req.body;
        
        if (!type || !data) {
            return res.status(400).json({ error: 'Type and data are required' });
        }
        
        let result;
        
        switch (type) {
            case 'username':
                result = validator.validateUsername(data);
                break;
            case 'password':
                result = validator.validatePassword(data);
                break;
            case 'role':
                result = validator.validateRole(data);
                break;
            case 'path':
                result = validator.validateNetworkPath(data);
                break;
            case 'email':
                result = validator.validateEmail(data);
                break;
            case 'port':
                result = validator.validatePort(data);
                break;
            default:
                return res.status(400).json({ error: 'Invalid validation type' });
        }
        
        res.json(result);
    } catch (error) {
        logger.error('Error validating data', error);
        res.status(500).json({ error: 'Validation failed' });
    }
});

module.exports = router;




