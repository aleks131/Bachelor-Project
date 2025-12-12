let currentConfig = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('config-section')) {
        await loadSettings();
        setupSettingsForm();
    }
});

async function loadSettings() {
    try {
        const response = await fetch('/api/admin/config');
        if (!response.ok) throw new Error('Failed to load config');
        
        const data = await response.json();
        currentConfig = data.config;
        
        renderSettingsForm(currentConfig);
    } catch (error) {
        console.error('Error loading settings:', error);
        if (window.toast) {
            toast.error('Failed to load settings');
        }
    }
}

function renderSettingsForm(config) {
    const container = document.querySelector('.config-form');
    if (!container) return;

    container.innerHTML = `
        <div class="settings-tabs">
            <button class="settings-tab active" data-tab="server">Server</button>
            <button class="settings-tab" data-tab="apps">Apps</button>
            <button class="settings-tab" data-tab="image">Image Processing</button>
            <button class="settings-tab" data-tab="files">File Management</button>
            <button class="settings-tab" data-tab="ui">UI Settings</button>
            <button class="settings-tab" data-tab="search">Search</button>
            <button class="settings-tab" data-tab="analytics">Analytics</button>
        </div>

        <div class="settings-content">
            ${renderServerSettings(config.server)}
            ${renderAppsSettings(config.apps)}
            ${renderImageSettings(config.imageProcessing)}
            ${renderFileSettings(config.fileManagement)}
            ${renderUISettings(config.ui)}
            ${renderSearchSettings(config.search)}
            ${renderAnalyticsSettings(config.analytics)}
        </div>

        <div class="settings-actions">
            <button class="btn btn-primary" onclick="saveAllSettings()">
                <i class="fas fa-save"></i> Save All Settings
            </button>
            <button class="btn btn-secondary" onclick="resetSettings()">
                <i class="fas fa-undo"></i> Reset to Defaults
            </button>
        </div>
    `;

    setupTabNavigation();
}

function renderServerSettings(server) {
    return `
        <div class="settings-panel" data-panel="server">
            <h3>Server Configuration</h3>
            <div class="form-group">
                <label>Port</label>
                <input type="number" id="server-port" value="${server.port}" min="1024" max="65535">
            </div>
            <div class="form-group">
                <label>Session Max Age (ms)</label>
                <input type="number" id="server-sessionMaxAge" value="${server.sessionMaxAge}" min="3600000">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="server-enableCaching" ${server.enableCaching ? 'checked' : ''}>
                    Enable Caching
                </label>
            </div>
        </div>
    `;
}

function renderAppsSettings(apps) {
    return `
        <div class="settings-panel" data-panel="apps">
            <h3>Application Settings</h3>
            ${Object.entries(apps).map(([key, app]) => `
                <div class="app-settings-group">
                    <h4>${app.name}</h4>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="app-${key}-enabled" ${app.enabled ? 'checked' : ''}>
                            Enabled
                        </label>
                    </div>
                    ${app.refreshInterval ? `
                        <div class="form-group">
                            <label>Refresh Interval (ms)</label>
                            <input type="number" id="app-${key}-refreshInterval" value="${app.refreshInterval}" min="1000">
                        </div>
                    ` : ''}
                    ${app.slideshowInterval ? `
                        <div class="form-group">
                            <label>Slideshow Interval (ms)</label>
                            <input type="number" id="app-${key}-slideshowInterval" value="${app.slideshowInterval}" min="1000">
                        </div>
                    ` : ''}
                    ${app.maxImageSize ? `
                        <div class="form-group">
                            <label>Max Image Size (bytes)</label>
                            <input type="number" id="app-${key}-maxImageSize" value="${app.maxImageSize}" min="0">
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function renderImageSettings(image) {
    return `
        <div class="settings-panel" data-panel="image">
            <h3>Image Processing</h3>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="imageProcessing-enabled" ${image.enabled ? 'checked' : ''}>
                    Enable Image Processing
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="imageProcessing-generateThumbnails" ${image.generateThumbnails ? 'checked' : ''}>
                    Generate Thumbnails
                </label>
            </div>
            <div class="form-group">
                <label>Thumbnail Quality</label>
                <input type="number" id="imageProcessing-thumbnailQuality" value="${image.thumbnailQuality}" min="1" max="100">
            </div>
            <div class="form-group">
                <label>Thumbnail Size (px)</label>
                <input type="number" id="imageProcessing-thumbnailSize" value="${image.thumbnailSize}" min="50" max="1000">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="imageProcessing-optimizeImages" ${image.optimizeImages ? 'checked' : ''}>
                    Optimize Images
                </label>
            </div>
            <div class="form-group">
                <label>Max Image Dimension (px)</label>
                <input type="number" id="imageProcessing-maxImageDimension" value="${image.maxImageDimension}" min="100" max="10000">
            </div>
        </div>
    `;
}

function renderFileSettings(files) {
    return `
        <div class="settings-panel" data-panel="files">
            <h3>File Management</h3>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="fileManagement-allowDelete" ${files.allowDelete ? 'checked' : ''}>
                    Allow Delete
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="fileManagement-allowRename" ${files.allowRename ? 'checked' : ''}>
                    Allow Rename
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="fileManagement-allowMove" ${files.allowMove ? 'checked' : ''}>
                    Allow Move
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="fileManagement-allowCopy" ${files.allowCopy ? 'checked' : ''}>
                    Allow Copy
                </label>
            </div>
            <div class="form-group">
                <label>Max File Size (bytes)</label>
                <input type="number" id="fileManagement-maxFileSize" value="${files.maxFileSize}" min="0">
            </div>
        </div>
    `;
}

function renderUISettings(ui) {
    return `
        <div class="settings-panel" data-panel="ui">
            <h3>UI Settings</h3>
            <div class="form-group">
                <label>Default Theme</label>
                <select id="ui-defaultTheme">
                    <option value="light" ${ui.defaultTheme === 'light' ? 'selected' : ''}>Light</option>
                    <option value="dark" ${ui.defaultTheme === 'dark' ? 'selected' : ''}>Dark</option>
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="ui-enableNotifications" ${ui.enableNotifications ? 'checked' : ''}>
                    Enable Notifications
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="ui-enableToast" ${ui.enableToast ? 'checked' : ''}>
                    Enable Toast Notifications
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="ui-enableKeyboardShortcuts" ${ui.enableKeyboardShortcuts ? 'checked' : ''}>
                    Enable Keyboard Shortcuts
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="ui-enableContextMenu" ${ui.enableContextMenu ? 'checked' : ''}>
                    Enable Context Menu
                </label>
            </div>
            <div class="form-group">
                <label>Items Per Page</label>
                <input type="number" id="ui-itemsPerPage" value="${ui.itemsPerPage}" min="10" max="500">
            </div>
        </div>
    `;
}

function renderSearchSettings(search) {
    return `
        <div class="settings-panel" data-panel="search">
            <h3>Search Settings</h3>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="search-enabled" ${search.enabled ? 'checked' : ''}>
                    Enable Search
                </label>
            </div>
            <div class="form-group">
                <label>Max Results</label>
                <input type="number" id="search-maxResults" value="${search.maxResults}" min="10" max="1000">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="search-enableHistory" ${search.enableHistory ? 'checked' : ''}>
                    Enable Search History
                </label>
            </div>
            <div class="form-group">
                <label>History Limit</label>
                <input type="number" id="search-historyLimit" value="${search.historyLimit}" min="5" max="50">
            </div>
        </div>
    `;
}

function renderAnalyticsSettings(analytics) {
    return `
        <div class="settings-panel" data-panel="analytics">
            <h3>Analytics Settings</h3>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="analytics-enabled" ${analytics.enabled ? 'checked' : ''}>
                    Enable Analytics
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="analytics-trackPageViews" ${analytics.trackPageViews ? 'checked' : ''}>
                    Track Page Views
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="analytics-trackFileOperations" ${analytics.trackFileOperations ? 'checked' : ''}>
                    Track File Operations
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="analytics-trackSearches" ${analytics.trackSearches ? 'checked' : ''}>
                    Track Searches
                </label>
            </div>
            <div class="form-group">
                <label>Retention Days</label>
                <input type="number" id="analytics-retentionDays" value="${analytics.retentionDays}" min="1" max="365">
            </div>
        </div>
    `;
}

function setupTabNavigation() {
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.settings-panel').forEach(p => p.style.display = 'none');
            
            tab.classList.add('active');
            const panel = document.querySelector(`[data-panel="${tab.dataset.tab}"]`);
            if (panel) {
                panel.style.display = 'block';
            }
        });
    });

    document.querySelectorAll('.settings-panel').forEach((panel, index) => {
        panel.style.display = index === 0 ? 'block' : 'none';
    });
}

function setupSettingsForm() {
    // Settings form is rendered dynamically
}

async function saveAllSettings() {
    if (!currentConfig) {
        if (window.toast) toast.error('No settings loaded');
        return;
    }

    try {
        const updatedConfig = {
            server: {
                port: parseInt(document.getElementById('server-port').value),
                sessionSecret: currentConfig.server.sessionSecret,
                sessionMaxAge: parseInt(document.getElementById('server-sessionMaxAge').value),
                enableCaching: document.getElementById('server-enableCaching').checked
            },
            apps: {
                'daily-plan': {
                    ...currentConfig.apps['daily-plan'],
                    enabled: document.getElementById('app-daily-plan-enabled').checked,
                    refreshInterval: parseInt(document.getElementById('app-daily-plan-refreshInterval')?.value || currentConfig.apps['daily-plan'].refreshInterval)
                },
                'gallery': {
                    ...currentConfig.apps['gallery'],
                    enabled: document.getElementById('app-gallery-enabled').checked,
                    slideshowInterval: parseInt(document.getElementById('app-gallery-slideshowInterval')?.value || currentConfig.apps['gallery'].slideshowInterval),
                    thumbnailSize: parseInt(document.getElementById('app-gallery-thumbnailSize')?.value || currentConfig.apps['gallery'].thumbnailSize),
                    maxImageSize: parseInt(document.getElementById('app-gallery-maxImageSize')?.value || currentConfig.apps['gallery'].maxImageSize)
                },
                'dashboard': {
                    ...currentConfig.apps['dashboard'],
                    enabled: document.getElementById('app-dashboard-enabled').checked,
                    refreshInterval: parseInt(document.getElementById('app-dashboard-refreshInterval')?.value || currentConfig.apps['dashboard'].refreshInterval)
                }
            },
            imageProcessing: {
                enabled: document.getElementById('imageProcessing-enabled').checked,
                generateThumbnails: document.getElementById('imageProcessing-generateThumbnails').checked,
                thumbnailQuality: parseInt(document.getElementById('imageProcessing-thumbnailQuality').value),
                thumbnailSize: parseInt(document.getElementById('imageProcessing-thumbnailSize').value),
                optimizeImages: document.getElementById('imageProcessing-optimizeImages').checked,
                maxImageDimension: parseInt(document.getElementById('imageProcessing-maxImageDimension').value),
                cacheDuration: currentConfig.imageProcessing.cacheDuration
            },
            fileManagement: {
                allowDelete: document.getElementById('fileManagement-allowDelete').checked,
                allowRename: document.getElementById('fileManagement-allowRename').checked,
                allowMove: document.getElementById('fileManagement-allowMove').checked,
                allowCopy: document.getElementById('fileManagement-allowCopy').checked,
                maxFileSize: parseInt(document.getElementById('fileManagement-maxFileSize').value),
                allowedFileTypes: currentConfig.fileManagement.allowedFileTypes
            },
            ui: {
                defaultTheme: document.getElementById('ui-defaultTheme').value,
                enableNotifications: document.getElementById('ui-enableNotifications').checked,
                enableToast: document.getElementById('ui-enableToast').checked,
                enableKeyboardShortcuts: document.getElementById('ui-enableKeyboardShortcuts').checked,
                enableContextMenu: document.getElementById('ui-enableContextMenu').checked,
                itemsPerPage: parseInt(document.getElementById('ui-itemsPerPage').value)
            },
            search: {
                enabled: document.getElementById('search-enabled').checked,
                maxResults: parseInt(document.getElementById('search-maxResults').value),
                enableHistory: document.getElementById('search-enableHistory').checked,
                historyLimit: parseInt(document.getElementById('search-historyLimit').value)
            },
            analytics: {
                enabled: document.getElementById('analytics-enabled').checked,
                trackPageViews: document.getElementById('analytics-trackPageViews').checked,
                trackFileOperations: document.getElementById('analytics-trackFileOperations').checked,
                trackSearches: document.getElementById('analytics-trackSearches').checked,
                retentionDays: parseInt(document.getElementById('analytics-retentionDays').value)
            },
            supportedFormats: currentConfig.supportedFormats
        };

        const response = await fetch('/api/admin/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedConfig)
        });

        if (!response.ok) throw new Error('Failed to save settings');

        if (window.toast) {
            toast.success('Settings saved successfully! Restart server for some changes to take effect.');
        }

        currentConfig = updatedConfig;
    } catch (error) {
        console.error('Error saving settings:', error);
        if (window.toast) {
            toast.error('Failed to save settings');
        }
    }
}

async function resetSettings() {
    if (!confirm('Reset all settings to defaults? This cannot be undone.')) return;

    try {
        const defaultConfig = {
            server: {
                port: 3000,
                sessionSecret: currentConfig.server.sessionSecret,
                sessionMaxAge: 86400000,
                enableCaching: true
            },
            apps: {
                'daily-plan': {
                    name: 'Daily Plan Viewer',
                    description: 'View daily plans based on time schedules',
                    icon: '📅',
                    enabled: true,
                    refreshInterval: 60000,
                    maxImageSize: 5242880
                },
                'gallery': {
                    name: 'Image Gallery',
                    description: 'Browse and display images/videos with slideshow',
                    icon: '🖼️',
                    enabled: true,
                    slideshowInterval: 5000,
                    thumbnailSize: 200,
                    maxImageSize: 10485760
                },
                'dashboard': {
                    name: 'Performance Dashboard',
                    description: 'KPI dashboard with customizable layouts',
                    icon: '📊',
                    enabled: true,
                    refreshInterval: 30000,
                    meetingMode: false
                }
            },
            imageProcessing: {
                enabled: true,
                generateThumbnails: true,
                thumbnailQuality: 80,
                thumbnailSize: 200,
                optimizeImages: true,
                maxImageDimension: 4096,
                cacheDuration: 86400000
            },
            fileManagement: {
                allowDelete: true,
                allowRename: true,
                allowMove: true,
                allowCopy: true,
                maxFileSize: 1073741824,
                allowedFileTypes: []
            },
            ui: {
                defaultTheme: 'dark',
                enableNotifications: true,
                enableToast: true,
                enableKeyboardShortcuts: true,
                enableContextMenu: true,
                itemsPerPage: 50
            },
            search: {
                enabled: true,
                maxResults: 100,
                enableHistory: true,
                historyLimit: 10
            },
            analytics: {
                enabled: true,
                trackPageViews: true,
                trackFileOperations: true,
                trackSearches: true,
                retentionDays: 90
            },
            supportedFormats: currentConfig.supportedFormats
        };

        const response = await fetch('/api/admin/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defaultConfig)
        });

        if (!response.ok) throw new Error('Failed to reset settings');

        if (window.toast) {
            toast.success('Settings reset to defaults');
        }

        await loadSettings();
    } catch (error) {
        console.error('Error resetting settings:', error);
        if (window.toast) {
            toast.error('Failed to reset settings');
        }
    }
}

window.saveAllSettings = saveAllSettings;
window.resetSettings = resetSettings;



