const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../auth');

const router = express.Router();
const ANALYTICS_FILE = path.join(__dirname, '../../data/analytics.json');

const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        const user = auth.getUserById(req.session.userId);
        if (user) {
            req.user = user;
            return next();
        }
    }
    res.status(401).json({ error: 'Authentication required' });
};

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ error: 'Admin access required' });
};

function loadAnalytics() {
    try {
        if (fs.existsSync(ANALYTICS_FILE)) {
            return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
        }
        return { events: [], stats: {} };
    } catch (error) {
        return { events: [], stats: {} };
    }
}

function saveAnalytics(data) {
    try {
        fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving analytics:', error);
        return false;
    }
}

function recordEvent(type, userId, details = {}) {
    const analytics = loadAnalytics();
    const event = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        userId,
        timestamp: new Date().toISOString(),
        ...details
    };
    
    analytics.events.push(event);
    
    // Update stats
    if (!analytics.stats[type]) {
        analytics.stats[type] = { count: 0, lastOccurrence: null };
    }
    analytics.stats[type].count++;
    analytics.stats[type].lastOccurrence = event.timestamp;
    
    // Keep only last 10000 events
    if (analytics.events.length > 10000) {
        analytics.events = analytics.events.slice(-10000);
    }
    
    saveAnalytics(analytics);
    return event;
}

/**
 * Record an analytics event
 */
router.post('/event', requireAuth, (req, res) => {
    try {
        const { type, details } = req.body;
        const userId = req.user.id;
        
        if (!type) {
            return res.status(400).json({ error: 'Event type is required' });
        }
        
        const event = recordEvent(type, userId, details);
        res.json({ success: true, event });
    } catch (error) {
        console.error('Error recording event:', error);
        res.status(500).json({ error: 'Failed to record event' });
    }
});

/**
 * Get analytics (admin only)
 */
router.get('/', requireAuth, requireAdmin, (req, res) => {
    try {
        const analytics = loadAnalytics();
        const { startDate, endDate, type } = req.query;
        
        let events = analytics.events;
        
        // Filter by date range
        if (startDate) {
            events = events.filter(e => new Date(e.timestamp) >= new Date(startDate));
        }
        if (endDate) {
            events = events.filter(e => new Date(e.timestamp) <= new Date(endDate));
        }
        
        // Filter by type
        if (type) {
            events = events.filter(e => e.type === type);
        }
        
        // Get summary stats
        const summary = {
            totalEvents: events.length,
            byType: {},
            byUser: {},
            byDay: {},
            recent: events.slice(-100).reverse()
        };
        
        events.forEach(event => {
            // By type
            summary.byType[event.type] = (summary.byType[event.type] || 0) + 1;
            
            // By user
            summary.byUser[event.userId] = (summary.byUser[event.userId] || 0) + 1;
            
            // By day
            const day = event.timestamp.split('T')[0];
            summary.byDay[day] = (summary.byDay[day] || 0) + 1;
        });
        
        res.json({
            summary,
            stats: analytics.stats,
            totalStored: analytics.events.length
        });
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

/**
 * Get user activity
 */
router.get('/user/:userId', requireAuth, (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;
        
        // Users can only see their own activity, admins can see all
        if (parseInt(userId) !== requestingUser.id && requestingUser.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const analytics = loadAnalytics();
        const userEvents = analytics.events
            .filter(e => e.userId === parseInt(userId))
            .slice(-100)
            .reverse();
        
        res.json({ events: userEvents, count: userEvents.length });
    } catch (error) {
        console.error('Error getting user analytics:', error);
        res.status(500).json({ error: 'Failed to get user analytics' });
    }
});

module.exports = router;
