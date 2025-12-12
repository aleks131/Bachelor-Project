class Analytics {
    constructor() {
        this.userId = null;
        this.queue = [];
        this.flushInterval = null;
        this.init();
    }

    async init() {
        try {
            const response = await fetch('/api/current-user');
            if (response.ok) {
                const data = await response.json();
                this.userId = data.user.id;
                this.startFlushInterval();
            }
        } catch (error) {
            console.error('Error initializing analytics:', error);
        }
    }

    /**
     * Track an event
     */
    track(eventType, details = {}) {
        if (!this.userId) {
            this.queue.push({ eventType, details, timestamp: Date.now() });
            return;
        }

        const event = {
            type: eventType,
            details: {
                ...details,
                url: window.location.pathname,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            }
        };

        // Send immediately
        this.sendEvent(event);
    }

    /**
     * Send event to server
     */
    async sendEvent(event) {
        try {
            await fetch('/api/analytics/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
        } catch (error) {
            console.error('Error sending analytics event:', error);
            // Queue for retry
            this.queue.push(event);
        }
    }

    /**
     * Flush queued events
     */
    async flushQueue() {
        if (this.queue.length === 0) return;

        const events = [...this.queue];
        this.queue = [];

        for (const event of events) {
            await this.sendEvent(event);
        }
    }

    /**
     * Start flush interval
     */
    startFlushInterval() {
        if (this.flushInterval) return;
        
        this.flushInterval = setInterval(() => {
            this.flushQueue();
        }, 5000); // Flush every 5 seconds

        // Flush immediately if we have queued events
        if (this.queue.length > 0) {
            this.flushQueue();
        }
    }

    /**
     * Track page view
     */
    trackPageView() {
        this.track('page_view', {
            page: window.location.pathname,
            referrer: document.referrer
        });
    }

    /**
     * Track app usage
     */
    trackAppUsage(appName, action = 'view') {
        this.track('app_usage', {
            app: appName,
            action
        });
    }

    /**
     * Track file operations
     */
    trackFileOperation(operation, filePath, success = true) {
        this.track('file_operation', {
            operation,
            filePath,
            success
        });
    }

    /**
     * Track search
     */
    trackSearch(query, resultsCount) {
        this.track('search', {
            query,
            resultsCount,
            queryLength: query.length
        });
    }

    /**
     * Track layout operations
     */
    trackLayoutOperation(operation, layoutId) {
        this.track('layout_operation', {
            operation,
            layoutId
        });
    }

    /**
     * Track performance
     */
    trackPerformance(metric, value, unit = 'ms') {
        this.track('performance', {
            metric,
            value,
            unit
        });
    }
}

const analytics = new Analytics();
window.analytics = analytics;

// Auto-track page views
document.addEventListener('DOMContentLoaded', () => {
    analytics.trackPageView();
    
    // Track performance
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        analytics.trackPerformance('page_load', loadTime);
    });
});
