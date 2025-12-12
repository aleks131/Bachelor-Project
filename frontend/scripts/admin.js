let users = [];
let currentEditingUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
    await checkAdminAccess();
    setupEventListeners();
    loadUsers();
    loadConfig();
});

async function checkAdminAccess() {
    try {
        const response = await fetch('/api/current-user');
        if (!response.ok) {
            window.location.href = '/';
            return;
        }
        
        const data = await response.json();
        if (data.user.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = '/dashboard';
            return;
        }
    } catch (error) {
        console.error('Error checking admin access:', error);
        window.location.href = '/';
    }
}

function setupEventListeners() {
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
        window.location.href = '/dashboard';
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.currentTarget.href) return; // Allow links to work
            const section = e.currentTarget.dataset.section;
            switchSection(section);
        });
    });

    document.getElementById('add-user-btn').addEventListener('click', () => {
        openUserModal();
    });

    document.getElementById('close-modal').addEventListener('click', closeUserModal);
    document.getElementById('cancel-user-btn').addEventListener('click', closeUserModal);
    document.getElementById('user-form').addEventListener('submit', handleUserSubmit);
    document.getElementById('save-config-btn').addEventListener('click', saveConfig);

    document.querySelectorAll('.test-path-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const pathType = e.currentTarget.dataset.path;
            const inputId = `path-${pathType === 'dailyPlan' ? 'daily-plan' : pathType === 'kpi' ? 'kpi' : pathType}`;
            const input = document.getElementById(inputId);
            await testPath(input.value, e.currentTarget);
        });
    });
}

function switchSection(section) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (!btn.href) btn.classList.remove('active');
    });
    document.querySelectorAll('.content-section').forEach(sect => sect.classList.remove('active'));
    
    const navBtn = document.querySelector(`[data-section="${section}"]`);
    if (navBtn) navBtn.classList.add('active');
    
    const sectionEl = document.getElementById(`${section}-section`);
    if (sectionEl) sectionEl.classList.add('active');

    if (section === 'paths') {
        renderPathsSection();
    } else if (section === 'layouts') {
        loadLayouts();
    } else if (section === 'analytics') {
        loadAnalytics();
    } else if (section === 'backup') {
        if (window.adminBackup) {
            window.adminBackup.loadBackups();
        }
    } else if (section === 'system') {
        const systemContent = document.getElementById('system-content');
        if (systemContent) {
            systemContent.innerHTML = `
                <div class="info-message">
                    <i class="fas fa-info-circle"></i>
                    Use the buttons above to run system diagnostics and health checks.
                </div>
            `;
        }
    }
}

async function loadAnalytics() {
    if (!window.analyticsDashboard) {
        console.error('Analytics dashboard not loaded');
        return;
    }

    const container = document.getElementById('analytics-content');
    if (!container) return;

    try {
        container.innerHTML = '<div class="loading">Loading analytics...</div>';
        
        await analyticsDashboard.loadAnalytics();
        analyticsDashboard.renderDashboard('analytics-content');
        
        if (window.toast) {
            toast.success('Analytics loaded');
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        container.innerHTML = '<div class="error-message">Failed to load analytics</div>';
        if (window.toast) {
            toast.error('Failed to load analytics');
        }
    }
}

async function loadLayouts() {
    try {
        const response = await fetch('/api/layouts');
        if (!response.ok) throw new Error('Failed to load layouts');
        
        const data = await response.json();
        const container = document.getElementById('layouts-list');
        
        if (data.layouts.length === 0) {
            container.innerHTML = `
                <div class="info-message">
                    <p>No layouts created yet.</p>
                    <a href="/admin/layout-builder" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Create Your First Layout
                    </a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = data.layouts.map(layout => `
            <div class="layout-card">
                <div class="layout-card-header">
                    <h3>${layout.name}</h3>
                    <div class="layout-badges">
                        ${layout.isGlobal ? '<span class="badge badge-admin">Global</span>' : ''}
                        ${layout.userId ? '<span class="badge badge-operator">User-Specific</span>' : ''}
                    </div>
                </div>
                <p class="layout-description">${layout.description || 'No description'}</p>
                <div class="layout-stats">
                    <span><i class="fas fa-cube"></i> ${layout.widgets?.length || 0} widgets</span>
                    <span><i class="fas fa-calendar"></i> ${new Date(layout.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="layout-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editLayout('${layout.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="previewLayout('${layout.id}')">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteLayout('${layout.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading layouts:', error);
        document.getElementById('layouts-list').innerHTML = 
            '<div class="error-message">Failed to load layouts</div>';
    }
}

function editLayout(layoutId) {
    window.location.href = `/admin/layout-builder?layout=${layoutId}`;
}

async function previewLayout(layoutId) {
    try {
        const response = await fetch(`/api/layouts/${layoutId}`);
        const data = await response.json();
        // Open preview in new window or modal
        alert(`Preview for: ${data.layout.name}\n\nWidgets: ${data.layout.widgets.length}`);
    } catch (error) {
        console.error('Error loading layout:', error);
        alert('Failed to load layout');
    }
}

async function deleteLayout(layoutId) {
    if (!confirm('Delete this layout?')) return;
    
    try {
        const response = await fetch(`/api/layouts/${layoutId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete layout');
        
        loadLayouts();
        showMessage('Layout deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting layout:', error);
        showMessage('Failed to delete layout', 'error');
    }
}

window.editLayout = editLayout;
window.previewLayout = previewLayout;
window.deleteLayout = deleteLayout;

async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Failed to load users');
        
        const data = await response.json();
        users = data.users;
        renderUsersTable();
    } catch (error) {
        console.error('Error loading users:', error);
        showMessage('Failed to load users', 'error');
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('users-tbody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">No users found. Click "Add User" to create one.</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td><span class="badge badge-${user.role}">${user.role}</span></td>
            <td>${(user.allowedApps || []).join(', ') || 'None'}</td>
            <td>${Object.keys(user.networkPaths || {}).length} paths configured</td>
            <td>
                <button class="btn-icon btn-edit" onclick="editUser(${user.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteUser(${user.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderPathsSection() {
    const content = document.getElementById('paths-content');
    
    if (users.length === 0) {
        content.innerHTML = '<p class="info-message">No users available. Create a user first.</p>';
        return;
    }

    content.innerHTML = `
        <div class="users-path-list">
            ${users.map(user => `
                <div class="user-path-card" onclick="editUserPaths(${user.id})">
                    <div class="user-path-header">
                        <h3>${user.username}</h3>
                        <span class="badge badge-${user.role}">${user.role}</span>
                    </div>
                    <div class="user-path-paths">
                        ${Object.keys(user.networkPaths || {}).length > 0 
                            ? Object.entries(user.networkPaths || {}).map(([key, path]) => `
                                <div class="path-row">
                                    <span class="path-key">${key}:</span>
                                    <span class="path-value">${path}</span>
                                </div>
                            `).join('')
                            : '<p class="no-paths">No paths configured</p>'
                        }
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    currentEditingUserId = userId;
    document.getElementById('modal-title').textContent = 'Edit User';
    document.getElementById('user-id').value = user.id;
    document.getElementById('username').value = user.username;
    document.getElementById('password').value = '';
    document.getElementById('password').required = false;
    document.getElementById('role').value = user.role;

    document.querySelectorAll('input[name="allowedApps"]').forEach(checkbox => {
        checkbox.checked = (user.allowedApps || []).includes(checkbox.value);
    });

    document.getElementById('path-main').value = user.networkPaths?.main || '';
    document.getElementById('path-daily-plan').value = user.networkPaths?.dailyPlan || '';
    document.getElementById('path-gallery').value = user.networkPaths?.gallery || '';
    document.getElementById('path-extra').value = user.networkPaths?.extra || '';
    document.getElementById('path-kpi').value = user.networkPaths?.kpi || '';

    document.getElementById('user-modal').classList.add('active');
}

function editUserPaths(userId) {
    editUser(userId);
    switchSection('users');
}

function openUserModal() {
    currentEditingUserId = null;
    document.getElementById('modal-title').textContent = 'Add User';
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('password').required = true;
    document.getElementById('user-modal').classList.add('active');
}

function closeUserModal() {
    document.getElementById('user-modal').classList.remove('active');
    currentEditingUserId = null;
}

async function handleUserSubmit(e) {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        allowedApps: Array.from(document.querySelectorAll('input[name="allowedApps"]:checked')).map(cb => cb.value),
        networkPaths: {
            main: document.getElementById('path-main').value || undefined,
            dailyPlan: document.getElementById('path-daily-plan').value || undefined,
            gallery: document.getElementById('path-gallery').value || undefined,
            extra: document.getElementById('path-extra').value || undefined,
            kpi: document.getElementById('path-kpi').value || undefined
        }
    };

    Object.keys(formData.networkPaths).forEach(key => {
        if (!formData.networkPaths[key]) delete formData.networkPaths[key];
    });

    if (!formData.password && currentEditingUserId) {
        delete formData.password;
    }

    try {
        let response;
        if (currentEditingUserId) {
            response = await fetch(`/api/admin/users/${currentEditingUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save user');
        }

        showMessage(`User ${currentEditingUserId ? 'updated' : 'created'} successfully`, 'success');
        closeUserModal();
        await loadUsers();
    } catch (error) {
        console.error('Error saving user:', error);
        showMessage(error.message || 'Failed to save user', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete user');
        }

        showMessage('User deleted successfully', 'success');
        await loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage(error.message || 'Failed to delete user', 'error');
    }
}

async function testPath(pathValue, buttonElement) {
    if (!pathValue) {
        showMessage('Please enter a path first', 'error');
        return;
    }

    const originalText = buttonElement.innerHTML;
    buttonElement.disabled = true;
    buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';

    try {
        const response = await fetch('/api/admin/test-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: pathValue })
        });

        const result = await response.json();

        if (result.exists && result.isDirectory && result.isReadable) {
            buttonElement.innerHTML = '<i class="fas fa-check-circle"></i> Valid';
            buttonElement.classList.add('btn-success');
            showMessage(`Path is valid. Found ${result.fileCount} items.`, 'success');
        } else {
            buttonElement.innerHTML = '<i class="fas fa-times-circle"></i> Invalid';
            buttonElement.classList.add('btn-danger');
            let message = 'Path is invalid: ';
            if (!result.exists) message += 'Path does not exist';
            else if (!result.isDirectory) message += 'Path is not a directory';
            else if (!result.isReadable) message += 'Cannot read directory';
            showMessage(message, 'error');
        }
    } catch (error) {
        console.error('Error testing path:', error);
        buttonElement.innerHTML = originalText;
        showMessage('Error testing path', 'error');
    } finally {
        setTimeout(() => {
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalText;
            buttonElement.classList.remove('btn-success', 'btn-danger');
        }, 3000);
    }
}

async function loadConfig() {
    try {
        const response = await fetch('/api/admin/config');
        if (!response.ok) throw new Error('Failed to load config');
        
        const data = await response.json();
        const config = data.config;
        
        if (config.server) {
            document.getElementById('server-port').value = config.server.port || 3000;
            document.getElementById('session-secret').value = config.server.sessionSecret || '';
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

async function saveConfig() {
    const config = {
        server: {
            port: parseInt(document.getElementById('server-port').value),
            sessionSecret: document.getElementById('session-secret').value
        }
    };

    try {
        const response = await fetch('/api/admin/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        if (!response.ok) throw new Error('Failed to save config');

        showMessage('Configuration saved successfully', 'success');
    } catch (error) {
        console.error('Error saving config:', error);
        showMessage('Failed to save configuration', 'error');
    }
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 100);

    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

window.editUser = editUser;
window.deleteUser = deleteUser;
window.editUserPaths = editUserPaths;
