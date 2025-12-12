class WidgetRenderer {
    constructor() {
        this.widgetHandlers = {
            'image-viewer': this.renderImageViewer.bind(this),
            'file-browser': this.renderFileBrowser.bind(this),
            'folder-scanner': this.renderFolderScanner.bind(this),
            'kpi-card': this.renderKpiCard.bind(this),
            'slideshow': this.renderSlideshow.bind(this),
            'custom-html': this.renderCustomHTML.bind(this),
            'text-display': this.renderTextDisplay.bind(this)
        };
    }

    async renderLayout(layout, container) {
        if (!layout || !layout.widgets) {
            container.innerHTML = '<div class="error">Invalid layout</div>';
            return;
        }

        container.innerHTML = '';
        
        for (const widget of layout.widgets) {
            const widgetElement = await this.renderWidget(widget);
            if (widgetElement) {
                widgetElement.style.position = 'absolute';
                widgetElement.style.left = `${widget.position.x}px`;
                widgetElement.style.top = `${widget.position.y}px`;
                widgetElement.style.width = `${widget.size.width}px`;
                widgetElement.style.height = `${widget.size.height}px`;
                container.appendChild(widgetElement);
            }
        }
    }

    async renderWidget(widget) {
        const handler = this.widgetHandlers[widget.type];
        if (!handler) {
            return this.renderPlaceholder(widget);
        }

        try {
            return await handler(widget);
        } catch (error) {
            console.error(`Error rendering widget ${widget.type}:`, error);
            return this.renderError(widget, error.message);
        }
    }

    async renderImageViewer(widget) {
        const div = document.createElement('div');
        div.className = 'widget-rendered widget-image-viewer';
        
        const folderPath = widget.config?.folderPath || '';
        
        if (!folderPath) {
            div.innerHTML = `
                <div class="widget-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No folder path configured</p>
                </div>
            `;
            return div;
        }

        try {
            const response = await fetch(`/api/dashboard/files?dir=${encodeURIComponent(folderPath)}`);
            const data = await response.json();
            const files = data.files || [];
            const images = files.filter(f => f.isImage).slice(0, 1);

            if (images.length > 0) {
                div.innerHTML = `
                    <div class="image-viewer-content">
                        <img src="${images[0].fullPath}" alt="Image" class="widget-image">
                        ${widget.config?.showControls ? `
                            <div class="image-controls">
                                <button onclick="widgetRenderer.nextImage(this, '${folderPath}')">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class="widget-empty">
                        <i class="fas fa-image"></i>
                        <p>No images found</p>
                    </div>
                `;
            }
        } catch (error) {
            div.innerHTML = `
                <div class="widget-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading images</p>
                </div>
            `;
        }

        return div;
    }

    async renderFileBrowser(widget) {
        const div = document.createElement('div');
        div.className = 'widget-rendered widget-file-browser';
        
        const rootPath = widget.config?.rootPath || '';
        
        if (!rootPath) {
            div.innerHTML = `
                <div class="widget-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No root path configured</p>
                </div>
            `;
            return div;
        }

        try {
            const response = await fetch(`/api/dashboard/files?dir=${encodeURIComponent(rootPath)}`);
            const data = await response.json();
            const files = data.files || [];

            div.innerHTML = `
                <div class="file-browser-content">
                    <div class="file-browser-header">
                        <h4><i class="fas fa-folder-open"></i> ${data.directory?.name || 'Files'}</h4>
                    </div>
                    <div class="file-browser-list">
                        ${files.slice(0, 20).map(file => `
                            <div class="file-item" title="${file.name}">
                                <i class="fas fa-${file.isImage ? 'image' : 'file'}"></i>
                                <span>${file.name}</span>
                            </div>
                        `).join('')}
                        ${files.length > 20 ? `<div class="file-more">+${files.length - 20} more</div>` : ''}
                    </div>
                </div>
            `;
        } catch (error) {
            div.innerHTML = `
                <div class="widget-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading files</p>
                </div>
            `;
        }

        return div;
    }

    async renderFolderScanner(widget) {
        const div = document.createElement('div');
        div.className = 'widget-rendered widget-folder-scanner';
        
        const scanPath = widget.config?.scanPath || '';
        const scanDepth = widget.config?.scanDepth || 2;
        
        if (!scanPath) {
            div.innerHTML = `
                <div class="widget-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No scan path configured</p>
                </div>
            `;
            return div;
        }

        div.innerHTML = `
            <div class="folder-scanner-content">
                <div class="scanner-header">
                    <h4><i class="fas fa-search"></i> Scanner</h4>
                </div>
                <div class="scanner-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Scanning folder...</p>
                </div>
            </div>
        `;

        try {
            const response = await fetch('/api/folder-scanner/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scanPath, maxDepth: scanDepth })
            });

            if (!response.ok) throw new Error('Scan failed');

            const data = await response.json();
            const results = data.scanResults || {};
            
            const stats = {
                total: results.totalFiles || 0,
                images: results.images || 0,
                videos: results.videos || 0,
                folders: results.totalFolders || 0,
                size: results.totalSize || 0
            };

            const folderList = (results.folders || []).slice(0, 10).map(f => f.name).join(', ');
            const fileList = (results.files || []).slice(0, 5).map(f => f.name).join(', ');

            div.innerHTML = `
                <div class="folder-scanner-content">
                    <div class="scanner-header">
                        <h4><i class="fas fa-folder"></i> ${data.path.split(/[/\\]/).pop() || 'Scanner'}</h4>
                        <button class="btn-rescan" onclick="this.closest('.widget-rendered').dispatchEvent(new CustomEvent('rescan'))">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    ${widget.config?.showStats !== false ? `
                        <div class="scanner-stats">
                            <div class="stat-item">
                                <span class="stat-value">${stats.total}</span>
                                <span class="stat-label">Files</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${stats.folders}</span>
                                <span class="stat-label">Folders</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${stats.images}</span>
                                <span class="stat-label">Images</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${stats.videos}</span>
                                <span class="stat-label">Videos</span>
                            </div>
                        </div>
                        ${folderList ? `
                            <div class="scanner-folders">
                                <strong>Folders:</strong>
                                <div class="folder-list">${folderList}</div>
                            </div>
                        ` : ''}
                    ` : ''}
                    <div class="scanner-status">
                        <i class="fas fa-check-circle" style="color: green;"></i>
                        <span>Scan complete</span>
                        ${stats.size > 0 ? `<span class="size-info">${(stats.size / 1024 / 1024).toFixed(2)} MB</span>` : ''}
                    </div>
                </div>
            `;

            div.addEventListener('rescan', () => {
                this.renderFolderScanner(widget).then(newDiv => {
                    div.replaceWith(newDiv);
                });
            });
        } catch (error) {
            div.innerHTML = `
                <div class="widget-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error scanning folder</p>
                    <small>${error.message}</small>
                </div>
            `;
        }

        return div;
    }

    async renderKpiCard(widget) {
        const div = document.createElement('div');
        div.className = 'widget-rendered widget-kpi-card';
        div.innerHTML = `
            <div class="kpi-card-content">
                <div class="kpi-title">${widget.config?.title || 'KPI'}</div>
                <div class="kpi-value">-</div>
            </div>
        `;
        return div;
    }

    async renderSlideshow(widget) {
        const div = document.createElement('div');
        div.className = 'widget-rendered widget-slideshow';
        div.innerHTML = `
            <div class="slideshow-content">
                <div class="slideshow-placeholder">
                    <i class="fas fa-images fa-2x"></i>
                    <p>Slideshow</p>
                </div>
            </div>
        `;
        return div;
    }

    renderCustomHTML(widget) {
        const div = document.createElement('div');
        div.className = 'widget-rendered widget-custom-html';
        const content = widget.config?.htmlContent || '';
        if (widget.config?.allowScripts) {
            div.innerHTML = content;
        } else {
            div.textContent = content;
        }
        return div;
    }

    renderTextDisplay(widget) {
        const div = document.createElement('div');
        div.className = 'widget-rendered widget-text-display';
        div.style.fontSize = widget.config?.fontSize || '16px';
        div.style.textAlign = widget.config?.textAlign || 'left';
        div.innerHTML = (widget.config?.text || '').replace(/\n/g, '<br>');
        return div;
    }

    renderPlaceholder(widget) {
        const div = document.createElement('div');
        div.className = 'widget-rendered widget-placeholder';
        div.innerHTML = `
            <div class="placeholder-content">
                <i class="fas fa-cube fa-2x"></i>
                <p>Unknown widget: ${widget.type}</p>
            </div>
        `;
        return div;
    }

    renderError(widget, message) {
        const div = document.createElement('div');
        div.className = 'widget-rendered widget-error';
        div.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle fa-2x"></i>
                <p>Error: ${message}</p>
            </div>
        `;
        return div;
    }

    async nextImage(button, folderPath) {
        // Implementation for image navigation
        console.log('Next image requested for:', folderPath);
    }
}

const widgetRenderer = new WidgetRenderer();
window.widgetRenderer = widgetRenderer;
