class DragDropUpload {
    constructor() {
        this.dropZones = [];
        this.init();
    }

    init() {
        this.setupGlobalDropZone();
    }

    setupGlobalDropZone() {
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.isInDropZone(e.target)) {
                return;
            }

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                this.handleFiles(files);
            }
        });
    }

    registerDropZone(element, options = {}) {
        const dropZone = {
            element,
            options: {
                destination: options.destination || null,
                onUploadStart: options.onUploadStart || null,
                onUploadProgress: options.onUploadProgress || null,
                onUploadComplete: options.onUploadComplete || null,
                onUploadError: options.onUploadError || null,
                allowedTypes: options.allowedTypes || null
            }
        };

        element.classList.add('drop-zone');
        
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');
        });

        element.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                await this.uploadFiles(files, dropZone);
            }
        });

        this.dropZones.push(dropZone);
        return dropZone;
    }

    async uploadFiles(files, dropZone) {
        const { options } = dropZone;
        
        if (options.allowedTypes) {
            files = files.filter(file => {
                const ext = '.' + file.name.split('.').pop().toLowerCase();
                return options.allowedTypes.includes(ext);
            });
        }

        if (files.length === 0) {
            if (window.toast) {
                toast.warning('No valid files to upload');
            }
            return;
        }

        if (options.onUploadStart) {
            options.onUploadStart(files);
        }

        try {
            if (files.length === 1) {
                await this.uploadSingle(files[0], options);
            } else {
                await this.uploadMultiple(files, options);
            }

            if (options.onUploadComplete) {
                options.onUploadComplete(files);
            }

            if (window.toast) {
                toast.success(`Uploaded ${files.length} file(s) successfully`);
            }

            if (window.analytics) {
                analytics.track('file_upload', { count: files.length, destination: options.destination });
            }
        } catch (error) {
            console.error('Upload error:', error);
            
            if (options.onUploadError) {
                options.onUploadError(error);
            }

            if (window.toast) {
                toast.error('Upload failed: ' + error.message);
            }
        }
    }

    async uploadSingle(file, options) {
        const formData = new FormData();
        formData.append('file', file);
        if (options.destination) {
            formData.append('destination', options.destination);
        }

        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && options.onUploadProgress) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    options.onUploadProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(xhr.responseText));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'));
            });

            xhr.open('POST', '/api/upload/single');
            xhr.send(formData);
        });
    }

    async uploadMultiple(files, options) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        if (options.destination) {
            formData.append('destination', options.destination);
        }

        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && options.onUploadProgress) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    options.onUploadProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(xhr.responseText));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'));
            });

            xhr.open('POST', '/api/upload/multiple');
            xhr.send(formData);
        });
    }

    handleFiles(files) {
        if (window.toast) {
            toast.info(`Dropped ${files.length} file(s). Register a drop zone to upload.`);
        }
    }

    isInDropZone(element) {
        return element.closest('.drop-zone') !== null;
    }
}

const dragDropUpload = new DragDropUpload();
window.dragDropUpload = dragDropUpload;



