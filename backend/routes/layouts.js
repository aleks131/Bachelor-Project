const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../auth');

const router = express.Router();
const LAYOUTS_DIR = path.join(__dirname, '../../data/layouts');

// Ensure layouts directory exists
if (!fs.existsSync(LAYOUTS_DIR)) {
    fs.mkdirSync(LAYOUTS_DIR, { recursive: true });
}

const requireAdmin = (req, res, next) => {
    if (req.session && req.session.userId) {
        const user = auth.getUserById(req.session.userId);
        if (user && user.role === 'admin') {
            req.user = user;
            return next();
        }
    }
    res.status(403).json({ error: 'Admin access required' });
};

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

function getLayoutPath(layoutId) {
    return path.join(LAYOUTS_DIR, `${layoutId}.json`);
}

function getAllLayouts() {
    const layouts = [];
    if (!fs.existsSync(LAYOUTS_DIR)) return layouts;
    
    const files = fs.readdirSync(LAYOUTS_DIR);
    files.forEach(file => {
        if (file.endsWith('.json')) {
            try {
                const layoutId = file.replace('.json', '');
                const layoutData = JSON.parse(fs.readFileSync(path.join(LAYOUTS_DIR, file), 'utf8'));
                layouts.push({
                    id: layoutId,
                    ...layoutData
                });
            } catch (error) {
                console.error(`Error reading layout ${file}:`, error);
            }
        }
    });
    
    return layouts;
}

// Get all layouts (admin only)
router.get('/', requireAdmin, (req, res) => {
    try {
        const layouts = getAllLayouts();
        res.json({ layouts });
    } catch (error) {
        console.error('Error fetching layouts:', error);
        res.status(500).json({ error: 'Failed to fetch layouts' });
    }
});

// Get specific layout
router.get('/:layoutId', requireAuth, (req, res) => {
    try {
        const { layoutId } = req.params;
        const layoutPath = getLayoutPath(layoutId);
        
        if (!fs.existsSync(layoutPath)) {
            return res.status(404).json({ error: 'Layout not found' });
        }
        
        const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
        
        // Check if user has access (admin or layout assigned to user)
        if (req.user.role !== 'admin' && layout.userId && layout.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        res.json({ layout });
    } catch (error) {
        console.error('Error fetching layout:', error);
        res.status(500).json({ error: 'Failed to fetch layout' });
    }
});

// Create new layout
router.post('/', requireAdmin, (req, res) => {
    try {
        const { name, description, widgets, isGlobal, userId } = req.body;
        
        if (!name || !widgets) {
            return res.status(400).json({ error: 'Name and widgets are required' });
        }
        
        const layoutId = `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const layout = {
            id: layoutId,
            name,
            description: description || '',
            widgets: widgets || [],
            isGlobal: isGlobal || false,
            userId: userId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: req.user.id
        };
        
        const layoutPath = getLayoutPath(layoutId);
        fs.writeFileSync(layoutPath, JSON.stringify(layout, null, 2));
        
        res.status(201).json({ layout });
    } catch (error) {
        console.error('Error creating layout:', error);
        res.status(500).json({ error: 'Failed to create layout' });
    }
});

// Update layout
router.put('/:layoutId', requireAdmin, (req, res) => {
    try {
        const { layoutId } = req.params;
        const layoutPath = getLayoutPath(layoutId);
        
        if (!fs.existsSync(layoutPath)) {
            return res.status(404).json({ error: 'Layout not found' });
        }
        
        const existingLayout = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
        const updates = req.body;
        
        const updatedLayout = {
            ...existingLayout,
            ...updates,
            id: layoutId, // Don't allow ID changes
            updatedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(layoutPath, JSON.stringify(updatedLayout, null, 2));
        
        res.json({ layout: updatedLayout });
    } catch (error) {
        console.error('Error updating layout:', error);
        res.status(500).json({ error: 'Failed to update layout' });
    }
});

// Delete layout
router.delete('/:layoutId', requireAdmin, (req, res) => {
    try {
        const { layoutId } = req.params;
        const layoutPath = getLayoutPath(layoutId);
        
        if (!fs.existsSync(layoutPath)) {
            return res.status(404).json({ error: 'Layout not found' });
        }
        
        fs.unlinkSync(layoutPath);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting layout:', error);
        res.status(500).json({ error: 'Failed to delete layout' });
    }
});

// Get available widgets
router.get('/widgets/list', requireAuth, (req, res) => {
    const widgets = [
        {
            id: 'image-viewer',
            name: 'Image Viewer',
            icon: 'fas fa-image',
            category: 'display',
            description: 'Display images from selected folder'
        },
        {
            id: 'file-browser',
            name: 'File Browser',
            icon: 'fas fa-folder-open',
            category: 'navigation',
            description: 'Browse files and folders'
        },
        {
            id: 'folder-scanner',
            name: 'Folder Scanner',
            icon: 'fas fa-search',
            category: 'utility',
            description: 'Scan and display folder contents'
        },
        {
            id: 'kpi-card',
            name: 'KPI Card',
            icon: 'fas fa-chart-line',
            category: 'display',
            description: 'Display KPI metrics'
        },
        {
            id: 'slideshow',
            name: 'Slideshow',
            icon: 'fas fa-images',
            category: 'display',
            description: 'Auto-rotating image slideshow'
        },
        {
            id: 'custom-html',
            name: 'Custom HTML',
            icon: 'fas fa-code',
            category: 'custom',
            description: 'Custom HTML content'
        },
        {
            id: 'text-display',
            name: 'Text Display',
            icon: 'fas fa-font',
            category: 'display',
            description: 'Display text content'
        }
    ];
    
    res.json({ widgets });
});

// Get widget config schema
router.get('/widgets/:widgetId/schema', requireAuth, (req, res) => {
    const { widgetId } = req.params;
    
    const schemas = {
        'image-viewer': {
            properties: {
                folderPath: { type: 'string', label: 'Folder Path', required: true },
                autoRefresh: { type: 'boolean', label: 'Auto Refresh', default: true },
                showControls: { type: 'boolean', label: 'Show Controls', default: true }
            }
        },
        'file-browser': {
            properties: {
                rootPath: { type: 'string', label: 'Root Path', required: true },
                showFolders: { type: 'boolean', label: 'Show Folders', default: true },
                showFiles: { type: 'boolean', label: 'Show Files', default: true },
                allowedExtensions: { type: 'array', label: 'Allowed Extensions', default: ['.jpg', '.png', '.gif'] }
            }
        },
        'folder-scanner': {
            properties: {
                scanPath: { type: 'string', label: 'Scan Path', required: true },
                scanDepth: { type: 'number', label: 'Scan Depth', default: 2 },
                showStats: { type: 'boolean', label: 'Show Statistics', default: true },
                autoScan: { type: 'boolean', label: 'Auto Scan', default: true }
            }
        },
        'kpi-card': {
            properties: {
                kpiId: { type: 'string', label: 'KPI ID', required: true },
                title: { type: 'string', label: 'Title', required: true },
                dataSource: { type: 'string', label: 'Data Source', default: 'api' }
            }
        },
        'slideshow': {
            properties: {
                folderPath: { type: 'string', label: 'Folder Path', required: true },
                interval: { type: 'number', label: 'Interval (seconds)', default: 5 },
                transition: { type: 'string', label: 'Transition', default: 'fade' }
            }
        },
        'custom-html': {
            properties: {
                htmlContent: { type: 'string', label: 'HTML Content', required: true, multiline: true },
                allowScripts: { type: 'boolean', label: 'Allow Scripts', default: false }
            }
        },
        'text-display': {
            properties: {
                text: { type: 'string', label: 'Text Content', required: true, multiline: true },
                fontSize: { type: 'string', label: 'Font Size', default: '16px' },
                textAlign: { type: 'string', label: 'Text Align', default: 'left' }
            }
        }
    };
    
    const schema = schemas[widgetId];
    if (!schema) {
        return res.status(404).json({ error: 'Widget schema not found' });
    }
    
    res.json({ schema });
});

module.exports = router;
