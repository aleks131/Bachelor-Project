class ErrorBoundary {
    constructor() {
        this.errors = [];
        this.setupGlobalErrorHandling();
    }
    
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'JavaScript Error', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Unhandled Promise Rejection');
        });
    }
    
    handleError(error, type, context = {}) {
        const errorInfo = {
            type: type,
            message: error?.message || String(error),
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...context
        };
        
        this.errors.push(errorInfo);
        
        if (this.errors.length > 50) {
            this.errors.shift();
        }
        
        this.logToServer(errorInfo);
        this.showUserFriendlyError(error);
    }
    
    async logToServer(errorInfo) {
        try {
            await fetch('/api/system/log-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(errorInfo)
            });
        } catch (e) {
            console.error('Failed to log error to server:', e);
        }
    }
    
    showUserFriendlyError(error) {
        const message = this.getUserFriendlyMessage(error);
        
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            console.error('Error:', error);
        }
    }
    
    getUserFriendlyMessage(error) {
        const errorMessage = error?.message || String(error);
        
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            return 'Network error. Please check your connection.';
        }
        if (errorMessage.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }
        if (errorMessage.includes('permission') || errorMessage.includes('401')) {
            return 'You do not have permission to perform this action.';
        }
        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
            return 'The requested resource was not found.';
        }
        
        return 'An unexpected error occurred. Please try again.';
    }
    
    getErrors() {
        return this.errors;
    }
    
    clearErrors() {
        this.errors = [];
    }
}

window.errorBoundary = new ErrorBoundary();


