const fs = require('fs');
const path = require('path');
const os = require('os');

class MonitoringSystem {
    constructor() {
        this.metrics = {
            startTime: Date.now(),
            requests: {
                total: 0,
                byEndpoint: {},
                byMethod: {},
                errors: 0,
                success: 0
            },
            websockets: {
                totalConnections: 0,
                activeConnections: 0,
                messagesSent: 0,
                messagesReceived: 0,
                connections: []
            },
            fileWatchers: {
                active: 0,
                paths: []
            },
            system: {
                memory: {},
                cpu: {},
                uptime: 0
            },
            errors: [],
            performance: {
                averageResponseTime: 0,
                responseTimes: []
            },
            users: {
                active: 0,
                total: 0,
                byRole: {}
            }
        };
        
        this.errorLog = [];
        this.maxErrorLogSize = 1000;
        this.maxResponseTimeHistory = 100;
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        setInterval(() => {
            this.updateSystemMetrics();
        }, 5000);
        
        setInterval(() => {
            this.cleanupOldData();
        }, 60000);
    }
    
    updateSystemMetrics() {
        const memUsage = process.memoryUsage();
        const cpus = os.cpus();
        
        this.metrics.system.memory = {
            used: Math.round(memUsage.heapUsed / 1024 / 1024),
            total: Math.round(memUsage.heapTotal / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024),
            rss: Math.round(memUsage.rss / 1024 / 1024),
            percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
        };
        
        const cpuUsage = this.calculateCpuUsage(cpus);
        this.metrics.system.cpu = {
            usage: cpuUsage,
            cores: cpus.length,
            model: cpus[0]?.model || 'Unknown'
        };
        
        this.metrics.system.uptime = Math.round(process.uptime());
        
        if (this.metrics.performance.responseTimes.length > 0) {
            const sum = this.metrics.performance.responseTimes.reduce((a, b) => a + b, 0);
            this.metrics.performance.averageResponseTime = Math.round(sum / this.metrics.performance.responseTimes.length);
        }
    }
    
    calculateCpuUsage(cpus) {
        let totalIdle = 0;
        let totalTick = 0;
        
        cpus.forEach(cpu => {
            for (let type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        
        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        const usage = 100 - ~~(100 * idle / total);
        
        return Math.max(0, Math.min(100, usage));
    }
    
    trackRequest(method, endpoint, statusCode, responseTime) {
        this.metrics.requests.total++;
        
        if (statusCode >= 400) {
            this.metrics.requests.errors++;
        } else {
            this.metrics.requests.success++;
        }
        
        if (!this.metrics.requests.byEndpoint[endpoint]) {
            this.metrics.requests.byEndpoint[endpoint] = {
                count: 0,
                errors: 0,
                averageTime: 0,
                times: []
            };
        }
        
        const endpointMetrics = this.metrics.requests.byEndpoint[endpoint];
        endpointMetrics.count++;
        endpointMetrics.times.push(responseTime);
        
        if (responseTime) {
            if (endpointMetrics.times.length > 50) {
                endpointMetrics.times.shift();
            }
            const sum = endpointMetrics.times.reduce((a, b) => a + b, 0);
            endpointMetrics.averageTime = Math.round(sum / endpointMetrics.times.length);
        }
        
        if (statusCode >= 400) {
            endpointMetrics.errors++;
        }
        
        if (!this.metrics.requests.byMethod[method]) {
            this.metrics.requests.byMethod[method] = 0;
        }
        this.metrics.requests.byMethod[method]++;
        
        if (responseTime) {
            this.metrics.performance.responseTimes.push(responseTime);
            if (this.metrics.performance.responseTimes.length > this.maxResponseTimeHistory) {
                this.metrics.performance.responseTimes.shift();
            }
        }
    }
    
    trackWebSocketConnection(ws, appType) {
        this.metrics.websockets.totalConnections++;
        this.metrics.websockets.activeConnections++;
        
        const connection = {
            id: ws.id || Date.now().toString(),
            appType: appType || 'unknown',
            connectedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            messagesSent: 0,
            messagesReceived: 0
        };
        
        ws.monitoringId = connection.id;
        this.metrics.websockets.connections.push(connection);
        
        return connection.id;
    }
    
    trackWebSocketDisconnection(ws) {
        if (this.metrics.websockets.activeConnections > 0) {
            this.metrics.websockets.activeConnections--;
        }
        
        if (ws.monitoringId) {
            const index = this.metrics.websockets.connections.findIndex(c => c.id === ws.monitoringId);
            if (index !== -1) {
                this.metrics.websockets.connections.splice(index, 1);
            }
        }
    }
    
    trackWebSocketMessage(ws, direction) {
        if (direction === 'sent') {
            this.metrics.websockets.messagesSent++;
            if (ws.monitoringId) {
                const conn = this.metrics.websockets.connections.find(c => c.id === ws.monitoringId);
                if (conn) {
                    conn.messagesSent++;
                    conn.lastActivity = new Date().toISOString();
                }
            }
        } else if (direction === 'received') {
            this.metrics.websockets.messagesReceived++;
            if (ws.monitoringId) {
                const conn = this.metrics.websockets.connections.find(c => c.id === ws.monitoringId);
                if (conn) {
                    conn.messagesReceived++;
                    conn.lastActivity = new Date().toISOString();
                }
            }
        }
    }
    
    trackFileWatcher(path, action) {
        if (action === 'add') {
            this.metrics.fileWatchers.active++;
            if (!this.metrics.fileWatchers.paths.includes(path)) {
                this.metrics.fileWatchers.paths.push(path);
            }
        } else if (action === 'remove') {
            if (this.metrics.fileWatchers.active > 0) {
                this.metrics.fileWatchers.active--;
            }
            const index = this.metrics.fileWatchers.paths.indexOf(path);
            if (index !== -1) {
                this.metrics.fileWatchers.paths.splice(index, 1);
            }
        }
    }
    
    logError(error, context = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            message: error.message || String(error),
            stack: error.stack,
            context: context,
            type: error.name || 'Error'
        };
        
        this.errorLog.push(errorEntry);
        this.metrics.errors.push(errorEntry);
        
        if (this.errorLog.length > this.maxErrorLogSize) {
            this.errorLog.shift();
        }
        
        if (this.metrics.errors.length > this.maxErrorLogSize) {
            this.metrics.errors.shift();
        }
        
        console.error('Monitored Error:', errorEntry);
    }
    
    updateUserMetrics(users) {
        this.metrics.users.total = users.length;
        this.metrics.users.byRole = {};
        
        users.forEach(user => {
            if (!this.metrics.users.byRole[user.role]) {
                this.metrics.users.byRole[user.role] = 0;
            }
            this.metrics.users.byRole[user.role]++;
        });
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: new Date().toISOString()
        };
    }
    
    getHealthStatus() {
        const health = {
            status: 'healthy',
            checks: {},
            timestamp: new Date().toISOString()
        };
        
        const memUsage = this.metrics.system.memory.percentage;
        health.checks.memory = {
            status: memUsage > 90 ? 'critical' : memUsage > 75 ? 'warning' : 'ok',
            value: `${memUsage}%`,
            message: `Memory usage: ${memUsage}%`
        };
        
        const cpuUsage = this.metrics.system.cpu.usage;
        health.checks.cpu = {
            status: cpuUsage > 90 ? 'critical' : cpuUsage > 75 ? 'warning' : 'ok',
            value: `${cpuUsage}%`,
            message: `CPU usage: ${cpuUsage}%`
        };
        
        const errorRate = this.metrics.requests.total > 0 
            ? (this.metrics.requests.errors / this.metrics.requests.total) * 100 
            : 0;
        health.checks.errorRate = {
            status: errorRate > 10 ? 'critical' : errorRate > 5 ? 'warning' : 'ok',
            value: `${errorRate.toFixed(2)}%`,
            message: `Error rate: ${errorRate.toFixed(2)}%`
        };
        
        const wsConnections = this.metrics.websockets.activeConnections;
        health.checks.websockets = {
            status: 'ok',
            value: wsConnections.toString(),
            message: `${wsConnections} active WebSocket connections`
        };
        
        const fileWatchers = this.metrics.fileWatchers.active;
        health.checks.fileWatchers = {
            status: 'ok',
            value: fileWatchers.toString(),
            message: `${fileWatchers} active file watchers`
        };
        
        const criticalChecks = Object.values(health.checks).filter(c => c.status === 'critical');
        const warningChecks = Object.values(health.checks).filter(c => c.status === 'warning');
        
        if (criticalChecks.length > 0) {
            health.status = 'critical';
        } else if (warningChecks.length > 0) {
            health.status = 'warning';
        }
        
        return health;
    }
    
    getErrorLog(limit = 100) {
        return this.errorLog.slice(-limit);
    }
    
    cleanupOldData() {
        const maxAge = 24 * 60 * 60 * 1000;
        const now = Date.now();
        
        this.metrics.errors = this.metrics.errors.filter(error => {
            const errorTime = new Date(error.timestamp).getTime();
            return (now - errorTime) < maxAge;
        });
        
        this.errorLog = this.errorLog.filter(error => {
            const errorTime = new Date(error.timestamp).getTime();
            return (now - errorTime) < maxAge;
        });
    }
    
    resetMetrics() {
        this.metrics = {
            startTime: Date.now(),
            requests: {
                total: 0,
                byEndpoint: {},
                byMethod: {},
                errors: 0,
                success: 0
            },
            websockets: {
                totalConnections: this.metrics.websockets.totalConnections,
                activeConnections: this.metrics.websockets.activeConnections,
                messagesSent: 0,
                messagesReceived: 0,
                connections: this.metrics.websockets.connections
            },
            fileWatchers: {
                active: this.metrics.fileWatchers.active,
                paths: this.metrics.fileWatchers.paths
            },
            system: this.metrics.system,
            errors: [],
            performance: {
                averageResponseTime: 0,
                responseTimes: []
            },
            users: this.metrics.users
        };
    }
}

module.exports = new MonitoringSystem();





