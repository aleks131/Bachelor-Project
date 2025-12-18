class MonitoringDashboard {
    constructor() {
        this.ws = null;
        this.updateInterval = null;
        this.init();
    }
    
    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.initializeWebSocket();
        this.loadData();
        this.startAutoRefresh();
    }
    
    async checkAuth() {
        try {
            const response = await fetch('/api/current-user');
            if (!response.ok) {
                window.location.href = '/';
                return;
            }
            const data = await response.json();
            if (data.user.role !== 'admin') {
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/';
        }
    }
    
    setupEventListeners() {
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadData();
        });
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
        
        document.getElementById('view-all-errors').addEventListener('click', () => {
            this.showAllErrors();
        });
    }
    
    initializeWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:${window.location.port || '3000'}/ws/monitoring`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('Monitoring WebSocket connected');
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'metrics_update') {
                this.updateDisplay(message.metrics, message.health);
            }
        };
        
        this.ws.onclose = () => {
            console.log('Monitoring WebSocket disconnected, reconnecting...');
            setTimeout(() => this.initializeWebSocket(), 2000);
        };
        
        this.ws.onerror = (error) => {
            console.error('Monitoring WebSocket error:', error);
        };
    }
    
    async loadData() {
        try {
            const [summary, health, performance, websockets, watchers, users, errors] = await Promise.all([
                fetch('/api/monitoring/summary').then(r => r.json()),
                fetch('/api/monitoring/health').then(r => r.json()),
                fetch('/api/monitoring/performance').then(r => r.json()),
                fetch('/api/monitoring/websockets').then(r => r.json()),
                fetch('/api/monitoring/file-watchers').then(r => r.json()),
                fetch('/api/monitoring/users').then(r => r.json()),
                fetch('/api/monitoring/errors?limit=10').then(r => r.json())
            ]);
            
            this.updateDisplay(summary, health);
            this.updatePerformance(performance);
            this.updateWebSockets(websockets);
            this.updateWatchers(watchers);
            this.updateUsers(users);
            this.updateErrors(errors.errors);
            this.updateEndpoints(performance.topEndpoints);
        } catch (error) {
            console.error('Error loading monitoring data:', error);
            this.showError('Failed to load monitoring data');
        }
    }
    
    updateDisplay(summary, health) {
        const healthStatus = document.getElementById('health-status');
        const healthText = document.getElementById('health-text');
        const uptimeEl = document.getElementById('uptime');
        const serverTimeEl = document.getElementById('server-time');
        
        healthStatus.className = `status-indicator ${health.status}`;
        healthText.textContent = health.status.toUpperCase();
        
        if (summary.uptime) {
            const hours = Math.floor(summary.uptime / 3600);
            const minutes = Math.floor((summary.uptime % 3600) / 60);
            uptimeEl.textContent = `${hours}h ${minutes}m`;
        }
        
        serverTimeEl.textContent = new Date().toLocaleTimeString();
        
        const healthContent = document.getElementById('health-content');
        healthContent.innerHTML = `
            <div class="health-checks">
                ${Object.entries(health.checks).map(([key, check]) => `
                    <div class="health-check ${check.status}">
                        <div class="check-label">${key.toUpperCase()}</div>
                        <div class="check-value">${check.value}</div>
                        <div class="check-message">${check.message}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        const systemContent = document.getElementById('system-content');
        if (summary.system) {
            systemContent.innerHTML = `
                <div class="system-metrics">
                    <div class="metric-item">
                        <div class="metric-label">Memory</div>
                        <div class="metric-value">${summary.system.memory}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">CPU</div>
                        <div class="metric-value">${summary.system.cpu}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Uptime</div>
                        <div class="metric-value">${summary.system.uptime}</div>
                    </div>
                </div>
            `;
        }
    }
    
    updatePerformance(performance) {
        const content = document.getElementById('performance-content');
        content.innerHTML = `
            <div class="performance-metrics">
                <div class="metric-item">
                    <div class="metric-label">Total Requests</div>
                    <div class="metric-value large">${performance.requests.total.toLocaleString()}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Error Rate</div>
                    <div class="metric-value ${parseFloat(performance.requests.errorRate) > 5 ? 'error' : ''}">${performance.requests.errorRate}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Avg Response Time</div>
                    <div class="metric-value">${performance.performance.averageResponseTime}ms</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Success</div>
                    <div class="metric-value success">${performance.requests.success.toLocaleString()}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Errors</div>
                    <div class="metric-value error">${performance.requests.errors.toLocaleString()}</div>
                </div>
            </div>
        `;
    }
    
    updateWebSockets(data) {
        const content = document.getElementById('websocket-content');
        content.innerHTML = `
            <div class="websocket-metrics">
                <div class="metric-item">
                    <div class="metric-label">Active Connections</div>
                    <div class="metric-value large">${data.websockets.activeConnections}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Total Connections</div>
                    <div class="metric-value">${data.websockets.totalConnections}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Messages Sent</div>
                    <div class="metric-value">${data.websockets.messagesSent.toLocaleString()}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Messages Received</div>
                    <div class="metric-value">${data.websockets.messagesReceived.toLocaleString()}</div>
                </div>
                ${data.connections.length > 0 ? `
                    <div class="connections-list">
                        <div class="list-header">Active Connections:</div>
                        ${data.connections.slice(0, 5).map(conn => `
                            <div class="connection-item">
                                <span class="conn-app">${conn.appType || 'unknown'}</span>
                                <span class="conn-time">${this.formatDuration(conn.duration)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    updateWatchers(data) {
        const content = document.getElementById('watcher-content');
        content.innerHTML = `
            <div class="watcher-metrics">
                <div class="metric-item">
                    <div class="metric-label">Active Watchers</div>
                    <div class="metric-value large">${data.fileWatchers.active}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Monitored Paths</div>
                    <div class="metric-value">${data.fileWatchers.paths.length}</div>
                </div>
                ${data.paths.length > 0 ? `
                    <div class="paths-list">
                        ${data.paths.slice(0, 5).map(p => `
                            <div class="path-item ${p.accessible ? 'accessible' : 'inaccessible'}">
                                <i class="fas fa-${p.accessible ? 'check-circle' : 'times-circle'}"></i>
                                <span class="path-text" title="${p.path}">${this.truncatePath(p.path)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    updateUsers(data) {
        const content = document.getElementById('users-content');
        content.innerHTML = `
            <div class="user-metrics">
                <div class="metric-item">
                    <div class="metric-label">Total Users</div>
                    <div class="metric-value large">${data.users.total}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Active Users</div>
                    <div class="metric-value">${data.users.active || 0}</div>
                </div>
                ${Object.keys(data.users.byRole).length > 0 ? `
                    <div class="roles-list">
                        ${Object.entries(data.users.byRole).map(([role, count]) => `
                            <div class="role-item">
                                <span class="role-name">${role}</span>
                                <span class="role-count">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    updateErrors(errors) {
        const content = document.getElementById('errors-content');
        if (errors.length === 0) {
            content.innerHTML = '<div class="no-data">No recent errors</div>';
            return;
        }
        
        content.innerHTML = `
            <div class="errors-list">
                ${errors.slice(0, 10).map(error => `
                    <div class="error-item">
                        <div class="error-header">
                            <span class="error-type">${error.type || 'Error'}</span>
                            <span class="error-time">${new Date(error.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div class="error-message">${this.escapeHtml(error.message || String(error))}</div>
                        ${error.context ? `<div class="error-context">${JSON.stringify(error.context)}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    updateEndpoints(endpoints) {
        const content = document.getElementById('endpoints-content');
        if (!endpoints || endpoints.length === 0) {
            content.innerHTML = '<div class="no-data">No endpoint data</div>';
            return;
        }
        
        content.innerHTML = `
            <div class="endpoints-list">
                ${endpoints.map(endpoint => `
                    <div class="endpoint-item">
                        <div class="endpoint-path">${endpoint.endpoint}</div>
                        <div class="endpoint-stats">
                            <span class="stat"><i class="fas fa-hashtag"></i> ${endpoint.count}</span>
                            <span class="stat ${endpoint.errors > 0 ? 'error' : ''}">
                                <i class="fas fa-exclamation-triangle"></i> ${endpoint.errors}
                            </span>
                            <span class="stat"><i class="fas fa-clock"></i> ${endpoint.averageTime}ms</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    startAutoRefresh() {
        this.updateInterval = setInterval(() => {
            this.loadData();
        }, 10000);
    }
    
    formatDuration(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    }
    
    truncatePath(path) {
        if (path.length > 50) {
            return '...' + path.slice(-47);
        }
        return path;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showError(message) {
        console.error(message);
    }
    
    async showAllErrors() {
        try {
            const response = await fetch('/api/monitoring/errors?limit=100');
            const data = await response.json();
            const errors = data.errors;
            
            const modal = document.createElement('div');
            modal.className = 'error-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>All Errors (${errors.length})</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${errors.map(error => `
                            <div class="error-item-full">
                                <div class="error-header">
                                    <span class="error-type">${error.type || 'Error'}</span>
                                    <span class="error-time">${new Date(error.timestamp).toLocaleString()}</span>
                                </div>
                                <div class="error-message">${this.escapeHtml(error.message || String(error))}</div>
                                ${error.stack ? `<div class="error-stack">${this.escapeHtml(error.stack)}</div>` : ''}
                                ${error.context ? `<div class="error-context">${JSON.stringify(error.context, null, 2)}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('.modal-close').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        } catch (error) {
            console.error('Error loading all errors:', error);
        }
    }
    
    async logout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MonitoringDashboard();
});





