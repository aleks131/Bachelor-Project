class FileManagement {
    constructor() {
        this.init();
    }

    init() {
        // Initialize file management features
    }

    async copyFile(source, destination) {
        try {
            const response = await fetch('/api/files/copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source, destination })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to copy file');
            }

            const data = await response.json();
            
            if (window.toast) {
                toast.success(data.message || 'File copied successfully');
            }
            
            if (window.analytics) {
                analytics.track('file_operation', { action: 'copy', source, destination });
            }

            return data;
        } catch (error) {
            console.error('Error copying file:', error);
            if (window.toast) {
                toast.error(error.message || 'Failed to copy file');
            }
            throw error;
        }
    }

    async moveFile(source, destination) {
        try {
            const response = await fetch('/api/files/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source, destination })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to move file');
            }

            const data = await response.json();
            
            if (window.toast) {
                toast.success(data.message || 'File moved successfully');
            }
            
            if (window.analytics) {
                analytics.track('file_operation', { action: 'move', source, destination });
            }

            return data;
        } catch (error) {
            console.error('Error moving file:', error);
            if (window.toast) {
                toast.error(error.message || 'Failed to move file');
            }
            throw error;
        }
    }

    async renameFile(filePath, newName) {
        try {
            const response = await fetch('/api/files/rename', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath, newName })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to rename file');
            }

            const data = await response.json();
            
            if (window.toast) {
                toast.success(data.message || 'File renamed successfully');
            }
            
            if (window.analytics) {
                analytics.track('file_operation', { action: 'rename', filePath, newName });
            }

            return data;
        } catch (error) {
            console.error('Error renaming file:', error);
            if (window.toast) {
                toast.error(error.message || 'Failed to rename file');
            }
            throw error;
        }
    }

    async deleteFile(filePath) {
        try {
            const response = await fetch('/api/files/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete file');
            }

            const data = await response.json();
            
            if (window.toast) {
                toast.success(data.message || 'File deleted successfully');
            }
            
            if (window.analytics) {
                analytics.track('file_operation', { action: 'delete', filePath });
            }

            return data;
        } catch (error) {
            console.error('Error deleting file:', error);
            if (window.toast) {
                toast.error(error.message || 'Failed to delete file');
            }
            throw error;
        }
    }

    async createFolder(folderPath, folderName) {
        try {
            const response = await fetch('/api/files/create-folder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folderPath, folderName })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create folder');
            }

            const data = await response.json();
            
            if (window.toast) {
                toast.success(data.message || 'Folder created successfully');
            }
            
            if (window.analytics) {
                analytics.track('file_operation', { action: 'create_folder', folderPath, folderName });
            }

            return data;
        } catch (error) {
            console.error('Error creating folder:', error);
            if (window.toast) {
                toast.error(error.message || 'Failed to create folder');
            }
            throw error;
        }
    }

    async previewFile(filePath) {
        try {
            const response = await fetch(`/api/files/preview?filePath=${encodeURIComponent(filePath)}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to preview file');
            }

            return await response.json();
        } catch (error) {
            console.error('Error previewing file:', error);
            throw error;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

const fileManagement = new FileManagement();
window.fileManagement = fileManagement;



