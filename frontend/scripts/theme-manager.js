class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply theme immediately to prevent flash
        this.applyTheme(this.theme);

        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });

        // Initialize toggle button
        this.setupToggleButton();
    }

    setupToggleButton() {
        // Wait for DOM content to be loaded if button not found immediately
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindButton());
        } else {
            this.bindButton();
        }
    }

    bindButton() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            // Remove existing listeners to prevent duplicates
            const newBtn = toggleBtn.cloneNode(true);
            toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
            
            // Initial state update
            this.updateButtonState(newBtn);
        }
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        this.theme = theme;
        localStorage.setItem('theme', theme);
        this.applyTheme(theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Also add class to body for broader CSS support
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }

        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            this.updateButtonState(toggleBtn);
        }
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    updateButtonState(btn) {
        const isDark = this.theme === 'dark';
        btn.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
        btn.title = `Switch to ${isDark ? 'light' : 'dark'} mode`;
    }
}

// Initialize immediately
const themeManager = new ThemeManager();
window.themeManager = themeManager;
