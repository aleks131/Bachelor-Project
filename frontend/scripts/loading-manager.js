class LoadingManager {
    constructor() {
        this.loadingStates = new Map();
        this.skeletons = new Map();
        this.init();
    }
    
    init() {
        this.createSkeletonStyles();
    }
    
    createSkeletonStyles() {
        if (document.getElementById('skeleton-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'skeleton-styles';
        style.textContent = `
            .skeleton {
                background: linear-gradient(90deg, 
                    var(--skeleton-bg, #f0f0f0) 25%, 
                    var(--skeleton-shine, #e0e0e0) 50%, 
                    var(--skeleton-bg, #f0f0f0) 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s ease-in-out infinite;
                border-radius: 4px;
            }
            
            [data-theme="dark"] .skeleton {
                --skeleton-bg: #2a2a2a;
                --skeleton-shine: #3a3a3a;
            }
            
            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .skeleton-text {
                height: 1em;
                margin: 0.5em 0;
            }
            
            .skeleton-title {
                height: 2em;
                width: 60%;
                margin-bottom: 1em;
            }
            
            .skeleton-card {
                height: 200px;
                border-radius: 12px;
                margin-bottom: 1rem;
            }
            
            .skeleton-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
            }
            
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top-color: var(--primary-color, #667eea);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    showLoading(elementId, message = 'Loading...') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const loadingId = `loading-${elementId}`;
        this.loadingStates.set(elementId, true);
        
        const overlay = document.createElement('div');
        overlay.id = loadingId;
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 1rem;">${message}</p>
            </div>
        `;
        
        element.style.position = 'relative';
        element.appendChild(overlay);
    }
    
    hideLoading(elementId) {
        const loadingId = `loading-${elementId}`;
        const overlay = document.getElementById(loadingId);
        if (overlay) {
            overlay.remove();
        }
        this.loadingStates.set(elementId, false);
    }
    
    showSkeleton(containerId, type = 'card', count = 3) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const skeletonId = `skeleton-${containerId}`;
        this.skeletons.set(containerId, true);
        
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const skeleton = this.createSkeleton(type);
            container.appendChild(skeleton);
        }
    }
    
    createSkeleton(type) {
        const skeleton = document.createElement('div');
        skeleton.className = `skeleton skeleton-${type}`;
        
        if (type === 'card') {
            skeleton.innerHTML = `
                <div class="skeleton-title"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text" style="width: 80%;"></div>
            `;
        } else if (type === 'list') {
            skeleton.innerHTML = `
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div class="skeleton-avatar"></div>
                    <div style="flex: 1;">
                        <div class="skeleton-text"></div>
                        <div class="skeleton-text" style="width: 60%;"></div>
                    </div>
                </div>
            `;
        }
        
        return skeleton;
    }
    
    hideSkeleton(containerId) {
        this.skeletons.set(containerId, false);
    }
    
    showProgress(elementId, progress = 0, message = '') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const progressId = `progress-${elementId}`;
        let progressBar = document.getElementById(progressId);
        
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = progressId;
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: rgba(102, 126, 234, 0.2);
                z-index: 10001;
            `;
            
            const fill = document.createElement('div');
            fill.id = `${progressId}-fill`;
            fill.style.cssText = `
                height: 100%;
                background: var(--primary-color, #667eea);
                width: ${progress}%;
                transition: width 0.3s ease;
            `;
            
            progressBar.appendChild(fill);
            document.body.appendChild(progressBar);
        }
        
        const fill = document.getElementById(`${progressId}-fill`);
        if (fill) {
            fill.style.width = `${progress}%`;
        }
        
        if (progress >= 100) {
            setTimeout(() => {
                progressBar?.remove();
            }, 300);
        }
    }
}

window.loadingManager = new LoadingManager();


