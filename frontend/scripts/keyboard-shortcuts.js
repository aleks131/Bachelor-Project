class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
        this.setupDefaultShortcuts();
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            const combo = this.getKeyCombo(e);
            const handler = this.shortcuts.get(combo);
            
            if (handler) {
                e.preventDefault();
                handler(e);
            }
        });

        // Disable shortcuts when typing in inputs
        document.addEventListener('keydown', (e) => {
            const target = e.target;
            if (target.tagName === 'INPUT' || 
                target.tagName === 'TEXTAREA' || 
                target.isContentEditable) {
                // Allow some shortcuts even when typing
                if (e.key === 'Escape') {
                    this.enabled = true;
                } else if (!['Escape', 'Enter'].includes(e.key)) {
                    return; // Don't process other shortcuts when typing
                }
            }
        });
    }

    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    }

    /**
     * Register a keyboard shortcut
     */
    register(combo, handler, description = '') {
        this.shortcuts.set(combo, handler);
        if (description) {
            console.log(`Shortcut registered: ${combo} - ${description}`);
        }
    }

    /**
     * Setup default shortcuts
     */
    setupDefaultShortcuts() {
        // Navigation
        this.register('ctrl+k', () => {
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }, 'Open global search');

        // Escape to close modals
        this.register('escape', () => {
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => modal.classList.remove('active'));
            
            const dropdowns = document.querySelectorAll('.dropdown.active, .settings-dropdown.active');
            dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        }, 'Close modals/dropdowns');

        // App navigation
        this.register('ctrl+1', () => window.location.href = '/app/daily-plan', 'Go to Daily Plan');
        this.register('ctrl+2', () => window.location.href = '/app/gallery', 'Go to Gallery');
        this.register('ctrl+3', () => window.location.href = '/app/dashboard', 'Go to Dashboard');
        this.register('ctrl+h', () => window.location.href = '/dashboard', 'Go to Home/Dashboard');

        // Admin shortcuts
        this.register('ctrl+shift+a', () => {
            if (window.location.pathname !== '/admin') {
                window.location.href = '/admin';
            }
        }, 'Open Admin Panel');

        this.register('ctrl+shift+l', () => {
            if (window.location.pathname !== '/admin/layout-builder') {
                window.location.href = '/admin/layout-builder';
            }
        }, 'Open Layout Builder');

        // Image viewer shortcuts
        this.register('arrowleft', () => {
            const prevBtn = document.querySelector('[id*="prev"], [id*="previous"]');
            if (prevBtn && !document.activeElement.matches('input, textarea')) {
                prevBtn.click();
            }
        }, 'Previous image/item');

        this.register('arrowright', () => {
            const nextBtn = document.querySelector('[id*="next"]');
            if (nextBtn && !document.activeElement.matches('input, textarea')) {
                nextBtn.click();
            }
        }, 'Next image/item');

        // Fullscreen
        this.register('f11', (e) => {
            e.preventDefault();
            const fullscreenBtn = document.querySelector('[id*="fullscreen"]');
            if (fullscreenBtn) {
                fullscreenBtn.click();
            } else {
                this.toggleFullscreen();
            }
        }, 'Toggle fullscreen');

        // Save
        this.register('ctrl+s', (e) => {
            e.preventDefault();
            const saveBtn = document.querySelector('[id*="save"], button:contains("Save")');
            if (saveBtn) {
                saveBtn.click();
            }
        }, 'Save');

        // Refresh
        this.register('f5', (e) => {
            const refreshBtn = document.querySelector('[id*="refresh"]');
            if (refreshBtn && e.shiftKey === false) {
                e.preventDefault();
                refreshBtn.click();
            }
        }, 'Refresh');
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Show shortcuts help
     */
    showHelp() {
        const shortcuts = Array.from(this.shortcuts.entries()).map(([combo, handler]) => ({
            combo,
            description: handler.description || combo
        }));

        const helpHTML = `
            <div class="shortcuts-help">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-list">
                    ${shortcuts.map(s => `
                        <div class="shortcut-item">
                            <kbd>${s.combo}</kbd>
                            <span>${s.description}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Create and show modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Keyboard Shortcuts</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${helpHTML}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Disable shortcuts
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Enable shortcuts
     */
    enable() {
        this.enabled = true;
    }
}

const keyboardShortcuts = new KeyboardShortcuts();
window.keyboardShortcuts = keyboardShortcuts;

// Register help shortcut
keyboardShortcuts.register('ctrl+/', () => {
    keyboardShortcuts.showHelp();
}, 'Show keyboard shortcuts');
