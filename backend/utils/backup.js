const fs = require('fs');
const path = require('path');

class BackupSystem {
    constructor() {
        this.backupDir = path.join(__dirname, '../../data/backups');
        this.ensureBackupDir();
    }
    
    ensureBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }
    
    createBackup(type = 'full') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup-${type}-${timestamp}`;
        const backupPath = path.join(this.backupDir, backupName);
        
        fs.mkdirSync(backupPath, { recursive: true });
        
        const backupData = {
            timestamp: new Date().toISOString(),
            type: type,
            version: '2.0.0'
        };
        
        try {
            if (type === 'full' || type === 'users') {
                const usersPath = path.join(__dirname, '../../data/users.json');
                if (fs.existsSync(usersPath)) {
                    fs.copyFileSync(usersPath, path.join(backupPath, 'users.json'));
                    backupData.users = true;
                }
            }
            
            if (type === 'full' || type === 'config') {
                const configPath = path.join(__dirname, '../../data/config.json');
                if (fs.existsSync(configPath)) {
                    fs.copyFileSync(configPath, path.join(backupPath, 'config.json'));
                    backupData.config = true;
                }
            }
            
            if (type === 'full' || type === 'layouts') {
                const layoutsDir = path.join(__dirname, '../../data/layouts');
                if (fs.existsSync(layoutsDir)) {
                    this.copyDirectory(layoutsDir, path.join(backupPath, 'layouts'));
                    backupData.layouts = true;
                }
            }
            
            if (type === 'full' || type === 'analytics') {
                const analyticsPath = path.join(__dirname, '../../data/analytics.json');
                if (fs.existsSync(analyticsPath)) {
                    fs.copyFileSync(analyticsPath, path.join(backupPath, 'analytics.json'));
                    backupData.analytics = true;
                }
            }
            
            backupData.success = true;
            fs.writeFileSync(
                path.join(backupPath, 'backup-info.json'),
                JSON.stringify(backupData, null, 2)
            );
            
            return {
                success: true,
                backupName: backupName,
                backupPath: backupPath,
                timestamp: backupData.timestamp
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
    
    listBackups() {
        if (!fs.existsSync(this.backupDir)) {
            return [];
        }
        
        const backups = [];
        const entries = fs.readdirSync(this.backupDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const infoPath = path.join(this.backupDir, entry.name, 'backup-info.json');
                if (fs.existsSync(infoPath)) {
                    try {
                        const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
                        backups.push({
                            name: entry.name,
                            path: path.join(this.backupDir, entry.name),
                            ...info
                        });
                    } catch (error) {
                        console.error(`Error reading backup info for ${entry.name}:`, error);
                    }
                }
            }
        }
        
        return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    restoreBackup(backupName) {
        const backupPath = path.join(this.backupDir, backupName);
        
        if (!fs.existsSync(backupPath)) {
            return { success: false, error: 'Backup not found' };
        }
        
        const infoPath = path.join(backupPath, 'backup-info.json');
        if (!fs.existsSync(infoPath)) {
            return { success: false, error: 'Backup info not found' };
        }
        
        try {
            const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
            
            if (info.users) {
                const usersBackup = path.join(backupPath, 'users.json');
                if (fs.existsSync(usersBackup)) {
                    const dataDir = path.join(__dirname, '../../data');
                    fs.copyFileSync(usersBackup, path.join(dataDir, 'users.json'));
                }
            }
            
            if (info.config) {
                const configBackup = path.join(backupPath, 'config.json');
                if (fs.existsSync(configBackup)) {
                    const dataDir = path.join(__dirname, '../../data');
                    fs.copyFileSync(configBackup, path.join(dataDir, 'config.json'));
                }
            }
            
            if (info.layouts) {
                const layoutsBackup = path.join(backupPath, 'layouts');
                if (fs.existsSync(layoutsBackup)) {
                    const layoutsDir = path.join(__dirname, '../../data/layouts');
                    if (fs.existsSync(layoutsDir)) {
                        fs.rmSync(layoutsDir, { recursive: true });
                    }
                    this.copyDirectory(layoutsBackup, layoutsDir);
                }
            }
            
            if (info.analytics) {
                const analyticsBackup = path.join(backupPath, 'analytics.json');
                if (fs.existsSync(analyticsBackup)) {
                    const dataDir = path.join(__dirname, '../../data');
                    fs.copyFileSync(analyticsBackup, path.join(dataDir, 'analytics.json'));
                }
            }
            
            return {
                success: true,
                restored: info,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    deleteBackup(backupName) {
        const backupPath = path.join(this.backupDir, backupName);
        
        if (!fs.existsSync(backupPath)) {
            return { success: false, error: 'Backup not found' };
        }
        
        try {
            fs.rmSync(backupPath, { recursive: true });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    cleanupOldBackups(keepDays = 30) {
        const backups = this.listBackups();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - keepDays);
        
        let deleted = 0;
        let errors = 0;
        
        for (const backup of backups) {
            const backupDate = new Date(backup.timestamp);
            if (backupDate < cutoffDate) {
                const result = this.deleteBackup(backup.name);
                if (result.success) {
                    deleted++;
                } else {
                    errors++;
                }
            }
        }
        
        return { deleted, errors, total: backups.length };
    }
}

module.exports = new BackupSystem();




