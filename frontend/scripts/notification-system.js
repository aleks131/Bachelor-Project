class NotificationSystem {
    constructor() {
        this.permissionGranted = false;
        this.notifications = [];
        this.init();
    }

    async init() {
        // Request notification permission
        if ('Notification' in window) {
            this.permissionGranted = Notification.permission === 'granted';
            
            if (Notification.permission === 'default') {
                // Request permission on first use
                this.requestPermission();
            }
        }

        // Listen for WebSocket notifications
        this.setupWebSocketNotifications();
    }

    async requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                const permission = await Notification.requestPermission();
                this.permissionGranted = permission === 'granted';
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        }
    }

    showNotification(title, options = {}) {
        if (!('Notification' in window)) {
            console.log('Notifications not supported');
            return;
        }

        if (!this.permissionGranted) {
            this.requestPermission().then(() => {
                if (this.permissionGranted) {
                    this.createNotification(title, options);
                }
            });
            return;
        }

        this.createNotification(title, options);
    }

    createNotification(title, options = {}) {
        const defaultOptions = {
            icon: '/assets/triple-a-logo.svg',
            badge: '/assets/triple-a-logo.svg',
            tag: 'smart-solutions-notification',
            requireInteraction: false,
            ...options
        };

        const notification = new Notification(title, defaultOptions);

        // Auto-close after 5 seconds (unless requireInteraction is true)
        if (!defaultOptions.requireInteraction) {
            setTimeout(() => notification.close(), 5000);
        }

        // Handle click
        notification.onclick = () => {
            window.focus();
            if (options.onClick) {
                options.onClick();
            }
            notification.close();
        };

        // Store notification
        this.notifications.push(notification);

        // Track notification
        if (window.analytics) {
            analytics.track('notification_shown', { title, type: options.type || 'info' });
        }

        return notification;
    }

    notifyFileChange(filePath, action = 'added') {
        const actionText = {
            'added': 'New file added',
            'changed': 'File updated',
            'deleted': 'File deleted'
        };

        this.showNotification(actionText[action] || 'File changed', {
            body: filePath.split(/[/\\]/).pop(),
            icon: '/assets/triple-a-logo.svg',
            type: 'file_change',
            onClick: () => {
                // Could open file or refresh view
                window.location.reload();
            }
        });
    }

    notifyNewContent(folder, count) {
        this.showNotification('New content available', {
            body: `${count} new item(s) in ${folder}`,
            type: 'content_update',
            onClick: () => {
                // Refresh current view
                if (window.location.pathname.includes('gallery')) {
                    window.location.reload();
                }
            }
        });
    }

    notifyScheduleChange(time, scheduleName) {
        this.showNotification('Schedule changed', {
            body: `Now showing: ${scheduleName} (${time})`,
            type: 'schedule',
            requireInteraction: false
        });
    }

    notifyUpdateAvailable(version) {
        this.showNotification('Update available', {
            body: `Version ${version} is available. Click to update.`,
            type: 'update',
            requireInteraction: true,
            onClick: () => {
                // Could trigger update process
                window.location.reload();
            }
        });
    }

    notifyError(message) {
        this.showNotification('Error', {
            body: message,
            type: 'error',
            icon: '/assets/error.png',
            requireInteraction: true
        });
    }

    notifySuccess(message) {
        this.showNotification('Success', {
            body: message,
            type: 'success',
            requireInteraction: false
        });
    }

    setupWebSocketNotifications() {
        // This would be called when WebSocket receives update messages
        // Listen for file change events from existing WebSocket connections
        window.addEventListener('filechange', (event) => {
            if (event.detail && event.detail.path) {
                this.notifyFileChange(event.detail.path, event.detail.action);
            }
        });

        window.addEventListener('contentupdate', (event) => {
            if (event.detail && event.detail.folder) {
                this.notifyNewContent(event.detail.folder, event.detail.count || 1);
            }
        });
    }

    closeAll() {
        this.notifications.forEach(notification => notification.close());
        this.notifications = [];
    }
}

const notificationSystem = new NotificationSystem();
window.notificationSystem = notificationSystem;

// Show welcome notification (optional, can be disabled)
if (Notification.permission === 'granted') {
    // Only show if user explicitly granted permission
    // notificationSystem.showNotification('Salling App Ready', {
    //     body: 'Notifications are enabled',
    //     type: 'info'
    // });
}
