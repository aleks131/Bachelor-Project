class AdminSystem {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('run-diagnostics-btn')?.addEventListener('click', () => {
            this.runDiagnostics();
        });
        
        document.getElementById('health-check-btn')?.addEventListener('click', () => {
            this.runHealthCheck();
        });
    }
    
    async runDiagnostics() {
        const content = document.getElementById('system-content');
        if (!content) return;
        
        content.innerHTML = '<div class="loading">Running diagnostics...</div>';
        
        try {
            const response = await fetch('/api/system/diagnostics');
            if (!response.ok) throw new Error('Failed to run diagnostics');
            
            const diagnostics = await response.json();
            this.renderDiagnostics(diagnostics);
        } catch (error) {
            content.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
            console.error('Error running diagnostics:', error);
        }
    }
    
    renderDiagnostics(diagnostics) {
        const content = document.getElementById('system-content');
        if (!content) return;
        
        content.innerHTML = `
            <div class="diagnostics-results">
                <div class="diagnostics-section">
                    <h3><i class="fas fa-server"></i> System Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Platform:</label>
                            <span>${diagnostics.system.platform}</span>
                        </div>
                        <div class="info-item">
                            <label>Architecture:</label>
                            <span>${diagnostics.system.arch}</span>
                        </div>
                        <div class="info-item">
                            <label>Node Version:</label>
                            <span>${diagnostics.system.nodeVersion}</span>
                        </div>
                        <div class="info-item">
                            <label>CPU Cores:</label>
                            <span>${diagnostics.system.cpu}</span>
                        </div>
                        <div class="info-item">
                            <label>Uptime:</label>
                            <span>${Math.round(diagnostics.system.uptime / 60)} minutes</span>
                        </div>
                        <div class="info-item">
                            <label>Memory Used:</label>
                            <span>${Math.round(diagnostics.system.memory.heapUsed / 1024 / 1024)}MB</span>
                        </div>
                        <div class="info-item">
                            <label>Memory Total:</label>
                            <span>${Math.round(diagnostics.system.memory.heapTotal / 1024 / 1024)}MB</span>
                        </div>
                    </div>
                </div>
                
                <div class="diagnostics-section">
                    <h3><i class="fas fa-check-circle"></i> System Checks</h3>
                    <div class="checks-list">
                        ${diagnostics.checks.map(check => `
                            <div class="check-item ${check.status}">
                                <i class="fas fa-${check.status === 'ok' ? 'check-circle' : check.status === 'warning' ? 'exclamation-triangle' : 'times-circle'}"></i>
                                <div class="check-info">
                                    <div class="check-name">${check.name}</div>
                                    <div class="check-message">${check.message}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    async runHealthCheck() {
        const content = document.getElementById('system-content');
        if (!content) return;
        
        content.innerHTML = '<div class="loading">Running health check...</div>';
        
        try {
            const response = await fetch('/api/system/health-check');
            if (!response.ok) throw new Error('Failed to run health check');
            
            const health = await response.json();
            this.renderHealthCheck(health);
        } catch (error) {
            content.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
            console.error('Error running health check:', error);
        }
    }
    
    renderHealthCheck(health) {
        const content = document.getElementById('system-content');
        if (!content) return;
        
        const statusClass = health.status === 'healthy' ? 'success' : health.status === 'degraded' ? 'warning' : 'error';
        
        content.innerHTML = `
            <div class="health-check-results">
                <div class="health-status ${statusClass}">
                    <i class="fas fa-${health.status === 'healthy' ? 'check-circle' : health.status === 'degraded' ? 'exclamation-triangle' : 'times-circle'}"></i>
                    <h3>System Status: ${health.status.toUpperCase()}</h3>
                    <p>Checked at: ${new Date(health.timestamp).toLocaleString()}</p>
                </div>
                
                <div class="health-checks-list">
                    ${health.checks.map(check => `
                        <div class="health-check-item ${check.status}">
                            <div class="check-header">
                                <i class="fas fa-${check.status === 'ok' ? 'check-circle' : check.status === 'warning' ? 'exclamation-triangle' : 'times-circle'}"></i>
                                <span class="check-name">${check.name}</span>
                                <span class="check-value">${check.value}</span>
                            </div>
                            ${check.details ? `
                                <div class="check-details">
                                    ${Object.entries(check.details).map(([key, value]) => `
                                        <div class="detail">${key}: ${value}</div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

if (document.getElementById('system-section')) {
    new AdminSystem();
}





