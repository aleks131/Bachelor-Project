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
        
        const appCard = document.createElement('div');
        appCard.className = `app-card premium-card ${isRecent ? 'recent' : ''}`;
        appCard.innerHTML = `
            <span class="app-icon premium-icon-large">${app.icon}</span>
            <h2 class="app-name premium-section-title" style="font-size: 2rem; margin-bottom: 1rem;">${app.name}</h2>
            <p class="app-description" style="font-size: 1.125rem; color: #6c757d; margin-bottom: 2rem; line-height: 1.6;">${app.description}</p>
            <button class="app-button premium-button" data-app="${appKey}">
                <i class="fas fa-arrow-right"></i>
                <span>Open Application</span>
            </button>
        `;
        
        const button = appCard.querySelector('.app-button');
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            openApp(appKey);
        });
        
        appCard.addEventListener('click', () => openApp(appKey));
        
        appsGrid.appendChild(appCard);
    });
    
    if (appsGrid.children.length === 0) {
        appsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">No applications available for your account.</p>';
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
