class AdminBackup {
    constructor() {
        this.init();
    }
    
    init() {
        this.loadBackups();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('create-backup-btn')?.addEventListener('click', () => {
            this.showCreateBackupDialog();
        });
    }
    
    async loadBackups() {
        const content = document.getElementById('backup-content');
        if (!content) return;
        
        try {
            content.innerHTML = '<div class="loading">Loading backups...</div>';
            
            const response = await fetch('/api/backup/list');
            if (!response.ok) throw new Error('Failed to load backups');
            
            const data = await response.json();
            this.renderBackups(data.backups || []);
        } catch (error) {
            content.innerHTML = `<div class="error-message">Error loading backups: ${error.message}</div>`;
            console.error('Error loading backups:', error);
        }
    }
    
    renderBackups(backups) {
        const content = document.getElementById('backup-content');
        if (!content) return;
        
        if (backups.length === 0) {
            content.innerHTML = `
                <div class="info-message">
                    <i class="fas fa-info-circle"></i>
                    No backups found. Create your first backup to get started.
                </div>
            `;
            return;
        }
        
        content.innerHTML = `
            <div class="backups-list">
                ${backups.map(backup => this.renderBackupItem(backup)).join('')}
            </div>
        `;
        
        backups.forEach(backup => {
            const restoreBtn = document.getElementById(`restore-${backup.name}`);
            const deleteBtn = document.getElementById(`delete-${backup.name}`);
            
            restoreBtn?.addEventListener('click', () => this.restoreBackup(backup.name));
            deleteBtn?.addEventListener('click', () => this.deleteBackup(backup.name));
        });
    }
    
    renderBackupItem(backup) {
        const date = new Date(backup.timestamp);
        const size = this.calculateBackupSize(backup);
        
        return `
            <div class="backup-item">
                <div class="backup-info">
                    <div class="backup-header">
                        <h4>${backup.name}</h4>
                        <span class="backup-type">${backup.type}</span>
                    </div>
                    <div class="backup-details">
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>${date.toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-database"></i>
                            <span>${this.getBackupContents(backup)}</span>
                        </div>
                        ${size ? `<div class="detail-item"><i class="fas fa-hdd"></i><span>${size}</span></div>` : ''}
                    </div>
                </div>
                <div class="backup-actions">
                    <button id="restore-${backup.name}" class="btn btn-sm btn-primary">
                        <i class="fas fa-undo"></i> Restore
                    </button>
                    <button id="delete-${backup.name}" class="btn btn-sm btn-danger">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }
    
    getBackupContents(backup) {
        const contents = [];
        if (backup.users) contents.push('Users');
        if (backup.config) contents.push('Config');
        if (backup.layouts) contents.push('Layouts');
        if (backup.analytics) contents.push('Analytics');
        return contents.join(', ') || 'Unknown';
    }
    
    calculateBackupSize(backup) {
        return null;
    }
    
    async showCreateBackupDialog() {
        const type = await this.promptBackupType();
        if (!type) return;
        
        if (window.toast) {
            window.toast.info('Creating backup...');
        }
        
        try {
            const response = await fetch('/api/backup/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });
            
            if (!response.ok) throw new Error('Failed to create backup');
            
            const result = await response.json();
            
            if (result.success) {
                if (window.toast) {
                    window.toast.success(`Backup created: ${result.backupName}`);
                }
                this.loadBackups();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            if (window.toast) {
                window.toast.error(`Failed to create backup: ${error.message}`);
            }
            console.error('Error creating backup:', error);
        }
    }
    
    async promptBackupType() {
        return new Promise((resolve) => {
            const type = prompt('Select backup type:\n1. full\n2. users\n3. config\n4. layouts\n5. analytics\n\nEnter number (1-5):');
            const types = { '1': 'full', '2': 'users', '3': 'config', '4': 'layouts', '5': 'analytics' };
            resolve(types[type] || 'full');
        });
    }
    
    async restoreBackup(backupName) {
        if (!confirm(`Are you sure you want to restore backup "${backupName}"? This will overwrite current data.`)) {
            return;
        }
        
        if (window.toast) {
            window.toast.info('Restoring backup...');
        }
        
        try {
            const response = await fetch('/api/backup/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backupName })
            });
            
            if (!response.ok) throw new Error('Failed to restore backup');
            
            const result = await response.json();
            
            if (result.success) {
                if (window.toast) {
                    window.toast.success('Backup restored successfully. Please refresh the page.');
                }
                setTimeout(() => location.reload(), 2000);
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            if (window.toast) {
                window.toast.error(`Failed to restore backup: ${error.message}`);
            }
            console.error('Error restoring backup:', error);
        }
    }
    
    async deleteBackup(backupName) {
        if (!confirm(`Are you sure you want to delete backup "${backupName}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`/api/backup/${encodeURIComponent(backupName)}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete backup');
            
            const result = await response.json();
            
            if (result.success) {
                if (window.toast) {
                    window.toast.success('Backup deleted successfully');
                }
                this.loadBackups();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            if (window.toast) {
                window.toast.error(`Failed to delete backup: ${error.message}`);
            }
            console.error('Error deleting backup:', error);
        }
    }
}

if (document.getElementById('backup-section')) {
    window.adminBackup = new AdminBackup();
}

