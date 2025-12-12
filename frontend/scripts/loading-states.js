class LoadingStates {
    constructor() {
        this.loadingOverlays = new Map();
    }

    showLoading(containerId, message = 'Loading...') {
        const container = document.getElementById(containerId) || document.querySelector(containerId);
        if (!container) return;

        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner-container">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;

        container.style.position = 'relative';
        container.appendChild(overlay);
        this.loadingOverlays.set(containerId, overlay);
    }

    hideLoading(containerId) {
        const overlay = this.loadingOverlays.get(containerId);
        if (overlay && overlay.parentElement) {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                this.loadingOverlays.delete(containerId);
            }, 300);
        }
    }

    showProgress(containerId, progress = 0, message = '') {
        const container = document.getElementById(containerId) || document.querySelector(containerId);
        if (!container) return;

        let overlay = this.loadingOverlays.get(containerId);
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            container.style.position = 'relative';
            container.appendChild(overlay);
            this.loadingOverlays.set(containerId, overlay);
        }

        overlay.innerHTML = `
            <div class="loading-progress-container">
                <div class="loading-progress-bar">
                    <div class="loading-progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="loading-progress-text">${progress}%</div>
                ${message ? `<div class="loading-message">${message}</div>` : ''}
            </div>
        `;
    }

    showInlineLoading(element, message = 'Loading...') {
        if (!element) return;

        const loadingEl = document.createElement('div');
        loadingEl.className = 'inline-loading';
        loadingEl.innerHTML = `
            <div class="inline-spinner"></div>
            <span>${message}</span>
        `;

        element.style.position = 'relative';
        element.appendChild(loadingEl);

        return () => {
            loadingEl.remove();
        };
    }
}

const loadingStates = new LoadingStates();
window.loadingStates = loadingStates;
