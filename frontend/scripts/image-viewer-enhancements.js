class ImageViewerEnhancements {
    constructor() {
        this.currentImage = null;
        this.zoomLevel = 1;
        this.rotation = 0;
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0
        };
        this.init();
    }
    
    init() {
        this.setupControls();
        this.setupKeyboardControls();
    }
    
    setupControls() {
        const viewer = document.querySelector('.image-viewer, .advanced-image-viewer');
        if (!viewer) return;
        
        const controls = document.createElement('div');
        controls.className = 'image-viewer-controls';
        controls.innerHTML = `
            <div class="viewer-control-group">
                <button class="viewer-btn" id="zoomIn" title="Zoom In (+)">
                    <i class="fas fa-search-plus"></i>
                </button>
                <button class="viewer-btn" id="zoomOut" title="Zoom Out (-)">
                    <i class="fas fa-search-minus"></i>
                </button>
                <button class="viewer-btn" id="resetZoom" title="Reset Zoom (0)">
                    <i class="fas fa-compress"></i>
                </button>
            </div>
            <div class="viewer-control-group">
                <button class="viewer-btn" id="rotateLeft" title="Rotate Left">
                    <i class="fas fa-undo"></i>
                </button>
                <button class="viewer-btn" id="rotateRight" title="Rotate Right">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="viewer-btn" id="resetRotation" title="Reset Rotation">
                    <i class="fas fa-sync"></i>
                </button>
            </div>
            <div class="viewer-control-group">
                <button class="viewer-btn" id="toggleFilters" title="Toggle Filters">
                    <i class="fas fa-sliders-h"></i>
                </button>
                <button class="viewer-btn" id="downloadImage" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="viewer-btn" id="fullscreen" title="Fullscreen (F11)">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        `;
        
        viewer.appendChild(controls);
        this.attachControlHandlers();
    }
    
    attachControlHandlers() {
        document.getElementById('zoomIn')?.addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoomOut')?.addEventListener('click', () => this.zoom(0.8));
        document.getElementById('resetZoom')?.addEventListener('click', () => this.resetZoom());
        document.getElementById('rotateLeft')?.addEventListener('click', () => this.rotate(-90));
        document.getElementById('rotateRight')?.addEventListener('click', () => this.rotate(90));
        document.getElementById('resetRotation')?.addEventListener('click', () => this.resetRotation());
        document.getElementById('toggleFilters')?.addEventListener('click', () => this.toggleFilterPanel());
        document.getElementById('downloadImage')?.addEventListener('click', () => this.downloadImage());
        document.getElementById('fullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case '+':
                case '=':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.zoom(1.2);
                    }
                    break;
                case '-':
                case '_':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.zoom(0.8);
                    }
                    break;
                case '0':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.resetZoom();
                    }
                    break;
                case 'ArrowLeft':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.rotate(-90);
                    }
                    break;
                case 'ArrowRight':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.rotate(90);
                    }
                    break;
            }
        });
    }
    
    zoom(factor) {
        const img = document.querySelector('.image-viewer img, .advanced-image-viewer img');
        if (!img) return;
        
        this.zoomLevel *= factor;
        this.zoomLevel = Math.max(0.1, Math.min(5, this.zoomLevel));
        
        img.style.transform = `scale(${this.zoomLevel}) rotate(${this.rotation}deg)`;
        this.updateZoomDisplay();
    }
    
    resetZoom() {
        this.zoomLevel = 1;
        const img = document.querySelector('.image-viewer img, .advanced-image-viewer img');
        if (img) {
            img.style.transform = `scale(1) rotate(${this.rotation}deg)`;
        }
        this.updateZoomDisplay();
    }
    
    rotate(degrees) {
        this.rotation += degrees;
        this.rotation = this.rotation % 360;
        
        const img = document.querySelector('.image-viewer img, .advanced-image-viewer img');
        if (img) {
            img.style.transform = `scale(${this.zoomLevel}) rotate(${this.rotation}deg)`;
        }
    }
    
    resetRotation() {
        this.rotation = 0;
        const img = document.querySelector('.image-viewer img, .advanced-image-viewer img');
        if (img) {
            img.style.transform = `scale(${this.zoomLevel}) rotate(0deg)`;
        }
    }
    
    toggleFilterPanel() {
        const panel = document.getElementById('filterPanel');
        if (panel) {
            panel.remove();
            return;
        }
        
        const filterPanel = document.createElement('div');
        filterPanel.id = 'filterPanel';
        filterPanel.className = 'filter-panel';
        filterPanel.innerHTML = `
            <h4>Image Filters</h4>
            <div class="filter-control">
                <label>Brightness: <span id="brightnessValue">100</span>%</label>
                <input type="range" id="brightness" min="0" max="200" value="100">
            </div>
            <div class="filter-control">
                <label>Contrast: <span id="contrastValue">100</span>%</label>
                <input type="range" id="contrast" min="0" max="200" value="100">
            </div>
            <div class="filter-control">
                <label>Saturation: <span id="saturationValue">100</span>%</label>
                <input type="range" id="saturation" min="0" max="200" value="100">
            </div>
            <div class="filter-control">
                <label>Blur: <span id="blurValue">0</span>px</label>
                <input type="range" id="blur" min="0" max="20" value="0">
            </div>
            <button class="premium-button" onclick="window.imageViewerEnhancements.resetFilters()">
                Reset Filters
            </button>
        `;
        
        document.querySelector('.image-viewer, .advanced-image-viewer')?.appendChild(filterPanel);
        
        ['brightness', 'contrast', 'saturation', 'blur'].forEach(filter => {
            const slider = document.getElementById(filter);
            const valueDisplay = document.getElementById(`${filter}Value`);
            
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                valueDisplay.textContent = value + (filter === 'blur' ? 'px' : '%');
                this.applyFilter(filter, value);
            });
        });
    }
    
    applyFilter(filter, value) {
        const img = document.querySelector('.image-viewer img, .advanced-image-viewer img');
        if (!img) return;
        
        this.filters[filter] = value;
        
        const filterString = `
            brightness(${this.filters.brightness}%)
            contrast(${this.filters.contrast}%)
            saturate(${this.filters.saturation}%)
            blur(${this.filters.blur}px)
        `;
        
        img.style.filter = filterString;
    }
    
    resetFilters() {
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0
        };
        
        const img = document.querySelector('.image-viewer img, .advanced-image-viewer img');
        if (img) {
            img.style.filter = 'none';
        }
        
        document.getElementById('filterPanel')?.remove();
    }
    
    downloadImage() {
        const img = document.querySelector('.image-viewer img, .advanced-image-viewer img');
        if (!img || !img.src) return;
        
        const link = document.createElement('a');
        link.href = img.src;
        link.download = img.alt || 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    toggleFullscreen() {
        const viewer = document.querySelector('.image-viewer, .advanced-image-viewer');
        if (!viewer) return;
        
        if (!document.fullscreenElement) {
            viewer.requestFullscreen().catch(err => {
                console.error('Error entering fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    updateZoomDisplay() {
        const display = document.getElementById('zoomDisplay');
        if (display) {
            display.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
    }
}

window.imageViewerEnhancements = new ImageViewerEnhancements();

