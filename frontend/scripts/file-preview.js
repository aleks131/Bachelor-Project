class FilePreview {
    constructor() {
        this.modal = null;
        this.init();
    }

    init() {
        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'file-preview-modal';
        this.modal.className = 'file-preview-modal';
        this.modal.innerHTML = `
            <div class="preview-modal-overlay"></div>
            <div class="preview-modal-content">
                <div class="preview-modal-header">
                    <h3 id="preview-file-name">Preview</h3>
                    <div class="preview-modal-actions">
                        <button class="preview-btn" id="preview-download" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="preview-btn" id="preview-close" title="Close (Esc)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="preview-modal-body" id="preview-body">
                    <div class="preview-loading">
                        <div class="loading-spinner"></div>
                        <div>Loading preview...</div>
                    </div>
                </div>
                <div class="preview-modal-footer" id="preview-footer">
                    <div class="preview-info" id="preview-info"></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        this.modal.querySelector('.preview-modal-overlay').addEventListener('click', () => this.close());
        this.modal.querySelector('#preview-close').addEventListener('click', () => this.close());
        this.modal.querySelector('#preview-download').addEventListener('click', () => this.download());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    async show(filePath) {
        if (!this.modal) {
            this.createModal();
        }

        this.modal.classList.add('active');
        
        const body = document.getElementById('preview-body');
        const info = document.getElementById('preview-info');
        const fileName = document.getElementById('preview-file-name');
        
        body.innerHTML = '<div class="preview-loading"><div class="loading-spinner"></div><div>Loading preview...</div></div>';
        info.innerHTML = '';
        fileName.textContent = this.getFileName(filePath);

        try {
            const previewData = await fileManagement.previewFile(filePath);

            // Display info
            info.innerHTML = `
                <div class="info-item">
                    <span class="info-label">Path:</span>
                    <span class="info-value">${filePath}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Size:</span>
                    <span class="info-value">${fileManagement.formatFileSize(previewData.size)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Modified:</span>
                    <span class="info-value">${new Date(previewData.modified).toLocaleString()}</span>
                </div>
            `;

            // Display preview based on type
            body.innerHTML = '';
            
            if (previewData.type === 'image') {
                body.innerHTML = `<img src="/api/files/preview?filePath=${encodeURIComponent(filePath)}" alt="Preview" class="preview-image">`;
            } else if (previewData.type === 'video') {
                body.innerHTML = `
                    <video controls class="preview-video">
                        <source src="/api/files/preview?filePath=${encodeURIComponent(filePath)}" type="video/mp4">
                        Your browser does not support video playback.
                    </video>
                `;
            } else if (previewData.type === 'text') {
                body.innerHTML = `<pre class="preview-text">${this.escapeHtml(previewData.content)}</pre>`;
            } else if (previewData.type === 'directory') {
                body.innerHTML = `
                    <div class="preview-directory">
                        <i class="fas fa-folder fa-5x"></i>
                        <p>This is a directory</p>
                    </div>
                `;
            } else {
                body.innerHTML = `
                    <div class="preview-unknown">
                        <i class="fas fa-file fa-5x"></i>
                        <p>Preview not available for this file type</p>
                    </div>
                `;
            }

            this.currentFilePath = filePath;

            if (window.analytics) {
                analytics.track('file_preview', { filePath, type: previewData.type });
            }
        } catch (error) {
            body.innerHTML = `<div class="preview-error">Error loading preview: ${error.message}</div>`;
        }
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('active');
            this.currentFilePath = null;
        }
    }

    download() {
        if (this.currentFilePath) {
            window.open(`/api/files/preview?filePath=${encodeURIComponent(this.currentFilePath)}&download=true`, '_blank');
        }
    }

    getFileName(filePath) {
        return filePath.split(/[/\\]/).pop();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const filePreview = new FilePreview();
window.filePreview = filePreview;



