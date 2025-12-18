const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../data/logs');
        this.maxLogSize = 10 * 1024 * 1024;
        this.maxLogFiles = 10;
        this.ensureLogDir();
    }
    
    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }
    
    getLogFile(level = 'app') {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `${level}-${date}.log`);
    }
    
    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}\n`;
    }
    
    writeLog(level, message, data = null) {
        const logFile = this.getLogFile(level);
        const logMessage = this.formatMessage(level, message, data);
        
        try {
            fs.appendFileSync(logFile, logMessage, 'utf8');
            this.rotateLogs(logFile);
        } catch (error) {
            console.error('Failed to write log:', error);
        }
    }
    
    rotateLogs(logFile) {
        try {
            const stats = fs.statSync(logFile);
            if (stats.size > this.maxLogSize) {
                const timestamp = Date.now();
                const rotatedFile = logFile.replace('.log', `-${timestamp}.log`);
                fs.renameSync(logFile, rotatedFile);
                this.cleanupOldLogs();
            }
        } catch (error) {
            console.error('Failed to rotate logs:', error);
        }
    }
    
    cleanupOldLogs() {
        try {
            const files = fs.readdirSync(this.logDir)
                .filter(f => f.endsWith('.log'))
                .map(f => ({
                    name: f,
                    path: path.join(this.logDir, f),
                    time: fs.statSync(path.join(this.logDir, f)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time);
            
            if (files.length > this.maxLogFiles) {
                const toDelete = files.slice(this.maxLogFiles);
                toDelete.forEach(file => {
                    try {
                        fs.unlinkSync(file.path);
                    } catch (error) {
                        console.error(`Failed to delete old log ${file.name}:`, error);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to cleanup old logs:', error);
        }
    }
    
    info(message, data = null) {
        this.writeLog('info', message, data);
        console.log(`[INFO] ${message}`, data || '');
    }
    
    warn(message, data = null) {
        this.writeLog('warn', message, data);
        console.warn(`[WARN] ${message}`, data || '');
    }
    
    error(message, error = null, data = null) {
        const errorData = error ? {
            message: error.message,
            stack: error.stack,
            ...data
        } : data;
        this.writeLog('error', message, errorData);
        console.error(`[ERROR] ${message}`, error || data || '');
    }
    
    debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            this.writeLog('debug', message, data);
            console.debug(`[DEBUG] ${message}`, data || '');
        }
    }
    
    audit(action, user, details = null) {
        const auditData = {
            action,
            user: user.username || user,
            userId: user.id || null,
            timestamp: new Date().toISOString(),
            ...details
        };
        this.writeLog('audit', `AUDIT: ${action}`, auditData);
    }
}

module.exports = new Logger();





