class AdvancedImageViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentImage = null;
        this.currentMetadata = null;
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            grayscale: 0
        };
        
        this.init();
    }

    init() {
        this.createUI();
        this.setupEventListeners();
    }

    createUI() {
        this.container.innerHTML = `
            <div class="advanced-image-viewer">
                <div class="viewer-toolbar">
                    <div class="toolbar-group">
                        <button class="toolbar-btn" id="zoom-in" title="Zoom In">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button class="toolbar-btn" id="zoom-out" title="Zoom Out">
                            <i class="fas fa-search-minus"></i>
                        </button>
                        <button class="toolbar-btn" id="zoom-reset" title="Reset Zoom">
                            <i class="fas fa-expand"></i>
                        </button>
                        <span class="zoom-level" id="zoom-level">100%</span>
                    </div>
                    <div class="toolbar-group">
                        <button class="toolbar-btn" id="rotate-left" title="Rotate Left">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="toolbar-btn" id="rotate-right" title="Rotate Right">
                            <i class="fas fa-redo"></i>
                        </button>
                    </div>
                    <div class="toolbar-group">
                        <button class="toolbar-btn" id="toggle-filters" title="Filters">
                            <i class="fas fa-sliders-h"></i>
                        </button>
                        <button class="toolbar-btn" id="toggle-info" title="Image Info">
                            <i class="fas fa-info-circle"></i>
                        </button>
                        <button class="toolbar-btn" id="download" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                <div class="viewer-content">
                    <div class="image-container" id="image-container">
                        <img id="viewer-image" src="" alt="Image">
                    </div>
                    <div class="image-info-panel" id="info-panel" style="display: none;">
                        <h4>Image Information</h4>
                        <div id="info-content"></div>
                    </div>
                </div>
                <div class="filters-panel" id="filters-panel" style="display: none;">
                    <h4>Filters</h4>
                    <div class="filter-control">
                        <label>Brightness</label>
                        <input type="range" id="filter-brightness" min="0" max="200" value="100">
                        <span id="brightness-value">100%</span>
                    </div>
                    <div class="filter-control">
                        <label>Contrast</label>
                        <input type="range" id="filter-contrast" min="0" max="200" value="100">
                        <span id="contrast-value">100%</span>
                    </div>
                    <div class="filter-control">
                        <label>Saturation</label>
                        <input type="range" id="filter-saturation" min="0" max="200" value="100">
                        <span id="saturation-value">100%</span>
                    </div>
                    <div class="filter-control">
                        <label>Blur</label>
                        <input type="range" id="filter-blur" min="0" max="20" value="0">
                        <span id="blur-value">0px</span>
                    </div>
                    <div class="filter-control">
                        <label>Grayscale</label>
                        <input type="range" id="filter-grayscale" min="0" max="100" value="0">
                        <span id="grayscale-value">0%</span>
                    </div>
                    <button class="btn btn-secondary" id="reset-filters">Reset Filters</button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('zoom-in').addEventListener('click', () => this.zoom(0.2));
        document.getElementById('zoom-out').addEventListener('click', () => this.zoom(-0.2));
        document.getElementById('zoom-reset').addEventListener('click', () => this.resetZoom());
        document.getElementById('rotate-left').addEventListener('click', () => this.rotate(-90));
        document.getElementById('rotate-right').addEventListener('click', () => this.rotate(90));
        document.getElementById('toggle-filters').addEventListener('click', () => this.toggleFilters());
        document.getElementById('toggle-info').addEventListener('click', () => this.toggleInfo());
        document.getElementById('download').addEventListener('click', () => this.downloadImage());
        document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());

        // Filter controls
        ['brightness', 'contrast', 'saturation', 'blur', 'grayscale'].forEach(filter => {
            const slider = document.getElementById(`filter-${filter}`);
            const value = document.getElementById(`${filter}-value`);
            
            slider.addEventListener('input', (e) => {
                this.filters[filter] = parseFloat(e.target.value);
                value.textContent = filter === 'blur' ? `${this.filters[filter]}px` : `${this.filters[filter]}%`;
                this.applyFilters();
            });
        });

        // Mouse wheel zoom
        const imageContainer = document.getElementById('image-container');
        imageContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoom(e.deltaY > 0 ? -0.1 : 0.1);
        });

        // Pan with mouse
        const img = document.getElementById('viewer-image');
        img.addEventListener('mousedown', (e) => this.startPan(e));
        document.addEventListener('mousemove', (e) => this.pan(e));
        document.addEventListener('mouseup', () => this.endPan());
    }

    async loadImage(imagePath) {
        this.currentImage = imagePath;
        
        /* DIRECT LOAD BYPASS - SmartImage disabled due to API 404s
        // Get metadata
        const metadata = await smartImage.getMetadata(imagePath);
        this.currentMetadata = metadata;
        
        // Get best fit
        const container = document.getElementById('image-container');
        const bestFit = await smartImage.getBestFit(
            imagePath,
            container.offsetWidth,
            container.offsetHeight
        );
        
        // Load optimized image
        const img = document.getElementById('viewer-image');
        await smartImage.loadImage(img, imagePath, {
            containerWidth: container.offsetWidth,
            containerHeight: container.offsetHeight
        });
        */
       
        // Direct Load
        const img = document.getElementById('viewer-image');
        img.src = imagePath;
        
        // Mock metadata for info panel
        this.currentMetadata = {
            width: img.naturalWidth || 0,
            height: img.naturalHeight || 0,
            aspectRatio: (img.naturalWidth / img.naturalHeight) || 0,
            format: imagePath.split('.').pop() || 'unknown',
            fileSize: 'Unknown',
            isPortrait: img.naturalHeight > img.naturalWidth,
            isLandscape: img.naturalWidth > img.naturalHeight
        };
        
        this.updateInfo();
        this.resetZoom();
    }

    zoom(delta) {
        this.zoomLevel = Math.max(0.1, Math.min(10, this.zoomLevel + delta));
        this.updateZoom();
    }

    resetZoom() {
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateZoom();
    }

    updateZoom() {
        const img = document.getElementById('viewer-image');
        img.style.transform = `scale(${this.zoomLevel}) translate(${this.panX}px, ${this.panY}px)`;
        document.getElementById('zoom-level').textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }

    rotate(angle) {
        const img = document.getElementById('viewer-image');
        const currentRotation = parseFloat(img.dataset.rotation || 0);
        const newRotation = (currentRotation + angle) % 360;
        img.dataset.rotation = newRotation;
        img.style.transform += ` rotate(${newRotation}deg)`;
    }

    startPan(e) {
        if (this.zoomLevel <= 1) return;
        this.isDragging = true;
        this.dragStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
    }

    pan(e) {
        if (!this.isDragging) return;
        this.panX = e.clientX - this.dragStart.x;
        this.panY = e.clientY - this.dragStart.y;
        this.updateZoom();
    }

    endPan() {
        this.isDragging = false;
    }

    applyFilters() {
        const img = document.getElementById('viewer-image');
        const { brightness, contrast, saturation, blur, grayscale } = this.filters;
        
        img.style.filter = `
            brightness(${brightness}%)
            contrast(${contrast}%)
            saturate(${saturation}%)
            blur(${blur}px)
            grayscale(${grayscale}%)
        `;
    }

    resetFilters() {
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            grayscale: 0
        };
        
        ['brightness', 'contrast', 'saturation', 'blur', 'grayscale'].forEach(filter => {
            const slider = document.getElementById(`filter-${filter}`);
            const value = document.getElementById(`${filter}-value`);
            slider.value = this.filters[filter];
            value.textContent = filter === 'blur' ? '0px' : '100%';
        });
        
        this.applyFilters();
    }

    toggleFilters() {
        const panel = document.getElementById('filters-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    toggleInfo() {
        const panel = document.getElementById('info-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            this.updateInfo();
        }
    }

    updateInfo() {
        if (!this.currentMetadata) return;
        
        const content = document.getElementById('info-content');
        content.innerHTML = `
            <div class="info-item">
                <strong>Dimensions:</strong> ${this.currentMetadata.width} × ${this.currentMetadata.height}px
            </div>
            <div class="info-item">
                <strong>Aspect Ratio:</strong> ${this.currentMetadata.aspectRatio.toFixed(2)}:1
            </div>
            <div class="info-item">
                <strong>Format:</strong> ${this.currentMetadata.format.toUpperCase()}
            </div>
            <div class="info-item">
                <strong>File Size:</strong> ${this.currentMetadata.fileSize}
            </div>
            <div class="info-item">
                <strong>Orientation:</strong> ${this.currentMetadata.isPortrait ? 'Portrait' : this.currentMetadata.isLandscape ? 'Landscape' : 'Square'}
            </div>
            ${this.currentMetadata.exif ? `
                <div class="info-item">
                    <strong>EXIF Data:</strong> Available
                </div>
            ` : ''}
        `;
    }

    downloadImage() {
        if (!this.currentImage) return;
        
        const link = document.createElement('a');
        link.href = this.currentImage;
        const filename = this.currentImage.split('/').pop() || 'image.jpg';
        link.download = filename;
        link.click();
    }
}

window.AdvancedImageViewer = AdvancedImageViewer;
