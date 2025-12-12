let currentUser = null;
let appConfig = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadUserData();
    setupEventListeners();
    renderApps();
});

async function loadUserData() {
    try {
        const userResponse = await fetch('/api/current-user');
        if (!userResponse.ok) {
            window.location.href = '/';
            return;
        }
        
        const userData = await userResponse.json();
        currentUser = userData.user;
        
        const configResponse = await fetch('/api/config');
        const configData = await configResponse.json();
        appConfig = configData;
        
        document.getElementById('userInfo').textContent = `Welcome, ${currentUser.username} (${currentUser.role})`;
    } catch (error) {
        console.error('Error loading user data:', error);
        window.location.href = '/';
    }
}

function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
}

function renderApps() {
    const appsGrid = document.getElementById('appsGrid');
    appsGrid.innerHTML = '';
    
    if (!appConfig || !currentUser) return;
    
    if (currentUser.role === 'admin') {
        appsGrid.innerHTML += `
            <div class="app-card premium-card admin-card" onclick="window.location.href='/admin'">
                <div style="margin-bottom: 1.5rem; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
                    <img src="/mockups/admin-panel.png" alt="Admin Panel" style="width: 100%; height: auto; display: block;" onerror="this.style.display='none'">
                </div>
                <div class="app-icon premium-icon-large admin-icon">
                    <i class="fas fa-cog"></i>
                </div>
                <h3 class="premium-section-title" style="font-size: 2rem; margin-bottom: 1rem;">Admin Panel</h3>
                <p style="font-size: 1.125rem; color: #6c757d; margin-bottom: 2rem; line-height: 1.6;">Manage users, configure paths, and system settings</p>
                <button class="premium-button" onclick="window.location.href='/admin'; event.stopPropagation();">
                    <i class="fas fa-arrow-right"></i>
                    <span>Open Admin Panel</span>
                </button>
            </div>
        `;
    }
    
    appsGrid.innerHTML += `
        <div class="app-card premium-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; cursor: pointer;" onclick="window.location.href='/mockups-showcase'">
            <div class="app-icon premium-icon-large" style="color: white;">
                <i class="fas fa-images"></i>
            </div>
            <h3 class="premium-section-title" style="font-size: 2rem; margin-bottom: 1rem; color: white;">Software Showcase</h3>
            <p style="font-size: 1.125rem; color: rgba(255,255,255,0.9); margin-bottom: 2rem; line-height: 1.6;">View all mockup images showing software functionality</p>
            <button class="premium-button" style="background: white; color: #667eea;" onclick="window.location.href='/mockups-showcase'; event.stopPropagation();">
                <i class="fas fa-eye"></i>
                <span>View Showcase</span>
            </button>
        </div>
    `;
    
    const { apps } = appConfig;
    const allowedApps = currentUser.allowedApps || [];
    const lastUsedApp = currentUser.lastUsedApp;
    
    const appKeys = Object.keys(apps);
    const sortedApps = appKeys.sort((a, b) => {
        if (a === lastUsedApp) return -1;
        if (b === lastUsedApp) return 1;
        return 0;
    });
    
    sortedApps.forEach(appKey => {
        if (!allowedApps.includes(appKey)) return;
        
        const app = apps[appKey];
        const isRecent = appKey === lastUsedApp;
        
        const mockupMap = {
            'daily-plan': 'daily-plan-viewer.png',
            'gallery': 'image-gallery.png',
            'dashboard': 'performance-dashboard.png'
        };
        const mockupImage = mockupMap[appKey] ? `/mockups/${mockupMap[appKey]}` : '';
        
        const appCard = document.createElement('div');
        appCard.className = `app-card premium-card ${isRecent ? 'recent' : ''}`;
        appCard.style.cssText = 'cursor: pointer; position: relative; overflow: hidden;';
        appCard.innerHTML = `
            ${mockupImage ? `<div style="margin-bottom: 1.5rem; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); position: relative;">
                <img src="${mockupImage}" alt="${app.name}" style="width: 100%; height: auto; display: block; transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);" onerror="this.style.display='none'" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, transparent 0%, rgba(102, 126, 234, 0.1) 100%); pointer-events: none;"></div>
            </div>` : ''}
            <div style="text-align: center;">
                <span class="app-icon premium-icon-large" style="display: inline-block; transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);">${app.icon}</span>
                <h2 class="app-name premium-section-title" style="font-size: 2rem; margin-bottom: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${app.name}</h2>
                <p class="app-description" style="font-size: 1.125rem; color: #6c757d; margin-bottom: 2rem; line-height: 1.6;">${app.description}</p>
                <button class="app-button premium-button" data-app="${appKey}" style="position: relative; overflow: hidden;">
                    <span style="position: relative; z-index: 1;">
                        <i class="fas fa-arrow-right"></i>
                        <span>Open Application</span>
                    </span>
                </button>
            </div>
        `;
        
        appCard.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.app-icon');
            if (icon) icon.style.transform = 'scale(1.2) rotate(5deg)';
        });
        
        appCard.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.app-icon');
            if (icon) icon.style.transform = 'scale(1) rotate(0deg)';
        });
        
        const button = appCard.querySelector('.app-button');
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            openApp(appKey);
        });
        
        appCard.addEventListener('click', () => openApp(appKey));
        
        appsGrid.appendChild(appCard);
    });
    
    if (appsGrid.children.length === 0) {
        if (window.enhancedUI && window.enhancedUI.showEmptyState) {
            window.enhancedUI.showEmptyState(
                appsGrid,
                '📱',
                'No Applications Available',
                'There are no applications configured for your account. Please contact your administrator.',
                null
            );
        } else {
            appsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">No applications available for your account.</p>';
        }
    }
}

async function openApp(appName) {
    try {
        await fetch('/api/update-last-app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appName })
        });
        
        window.location.href = `/app/${appName}`;
    } catch (error) {
        console.error('Error updating last app:', error);
        window.location.href = `/app/${appName}`;
    }
}
