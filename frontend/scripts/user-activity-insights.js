class UserActivityInsights {
    constructor() {
        this.activityData = null;
        this.init();
    }
    
    async init() {
        await this.loadActivityData();
        this.renderInsights();
    }
    
    async loadActivityData() {
        try {
            const response = await fetch('/api/system/user-activity', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.activityData = data.stats;
            }
        } catch (error) {
            console.error('Error loading user activity:', error);
        }
    }
    
    renderInsights() {
        const container = document.getElementById('userActivityInsights');
        if (!container || !this.activityData) return;
        
        const sortedUsers = this.activityData.sort((a, b) => b.pageViews - a.pageViews);
        
        container.innerHTML = `
            <div class="activity-header">
                <h3><i class="fas fa-chart-line"></i> User Activity Insights</h3>
                <button class="refresh-btn" onclick="window.userActivityInsights.refresh()">
                    <i class="fas fa-sync"></i> Refresh
                </button>
            </div>
            <div class="activity-stats">
                ${sortedUsers.map(user => this.renderUserCard(user)).join('')}
            </div>
        `;
    }
    
    renderUserCard(user) {
        const lastActive = user.lastActive ? 
            new Date(user.lastActive).toLocaleString() : 'Never';
        
        return `
            <div class="user-activity-card">
                <div class="user-header">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-info">
                        <h4>${user.username}</h4>
                        <p class="user-role">${this.getUserRole(user.username)}</p>
                    </div>
                </div>
                <div class="user-stats">
                    <div class="stat-item">
                        <i class="fas fa-eye"></i>
                        <span class="stat-value">${user.pageViews}</span>
                        <span class="stat-label">Page Views</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-mouse-pointer"></i>
                        <span class="stat-value">${user.actionCount}</span>
                        <span class="stat-label">Actions</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-clock"></i>
                        <span class="stat-value">${lastActive}</span>
                        <span class="stat-label">Last Active</span>
                    </div>
                </div>
                <div class="user-apps">
                    <strong>Apps Used:</strong>
                    <div class="apps-list">
                        ${user.appsUsed.map(app => `
                            <span class="app-badge">${this.getAppName(app)}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    getUserRole(username) {
        return 'User';
    }
    
    getAppName(appKey) {
        const appNames = {
            'daily-plan': 'Daily Plan',
            'gallery': 'Gallery',
            'dashboard': 'Dashboard',
            'admin': 'Admin'
        };
        return appNames[appKey] || appKey;
    }
    
    async refresh() {
        await this.loadActivityData();
        this.renderInsights();
        
        if (window.showToast) {
            window.showToast('Activity data refreshed', 'success');
        }
    }
}

window.userActivityInsights = new UserActivityInsights();


