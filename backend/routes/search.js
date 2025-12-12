const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../auth');
const imageProcessor = require('../utils/image-processor');
const config = require('../../data/config.json');

const router = express.Router();
const SUPPORTED_FORMATS = config.supportedFormats.map(f => f.toLowerCase());

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

/**
 * Build search index
 */
router.get('/index', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const index = {};
        
        // Index files from user's network paths
        const pathsToIndex = [
            user.networkPaths?.main,
            user.networkPaths?.gallery,
            user.networkPaths?.extra,
            user.networkPaths?.kpi,
            user.networkPaths?.dailyPlan
        ].filter(p => p);

        for (const networkPath of pathsToIndex) {
            try {
                await indexDirectory(networkPath, index, networkPath);
            } catch (error) {
                console.error(`Error indexing ${networkPath}:`, error);
            }
        }

        res.json({ index, count: Object.keys(index).length });
    } catch (error) {
        console.error('Error building search index:', error);
        res.status(500).json({ error: 'Failed to build index', message: error.message });
    }
});

/**
 * Search query
 */
router.post('/query', requireAuth, async (req, res) => {
    try {
        const { query, apps, fileTypes, limit = 50 } = req.body;
        const user = req.user;

        if (!query || query.length < 2) {
            return res.json({ results: [], total: 0, query });
        }

        const results = [];
        const searchTerms = query.toLowerCase().split(/\s+/);
        
        // Search in user's network paths
        const pathsToSearch = getPathsForApps(user, apps);

        for (const networkPath of pathsToSearch) {
            try {
                const matches = await searchDirectory(networkPath, searchTerms, fileTypes, limit);
                results.push(...matches);
            } catch (error) {
                console.error(`Error searching ${networkPath}:`, error);
            }
        }

        // Sort by relevance
        results.sort((a, b) => b.relevance - a.relevance);

        // Limit results
        const limitedResults = results.slice(0, parseInt(limit));

        res.json({
            results: limitedResults,
            total: results.length,
            query
        });
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).json({ error: 'Search failed', message: error.message });
    }
});

/**
 * Helper: Index directory
 */
async function indexDirectory(dirPath, index, basePath) {
    if (!fs.existsSync(dirPath)) return;

    try {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            try {
                const itemPath = path.join(dirPath, item);
                const stats = fs.statSync(itemPath);

                if (stats.isDirectory()) {
                    await indexDirectory(itemPath, index, basePath);
                } else {
                    const ext = path.extname(item).toLowerCase();
                    if (SUPPORTED_FORMATS.includes(ext)) {
                        const relativePath = path.relative(basePath, itemPath);
                        index[itemPath] = {
                            name: item,
                            path: itemPath,
                            relativePath,
                            type: ext.match(/\.(jpg|jpeg|png|gif|webp|bmp)/i) ? 'image' : 'file',
                            extension: ext,
                            size: stats.size,
                            modified: stats.mtime
                        };
                    }
                }
            } catch (error) {
                // Skip items that can't be accessed
            }
        }
    } catch (error) {
        // Skip directories that can't be accessed
    }
}

/**
 * Helper: Search directory
 */
async function searchDirectory(dirPath, searchTerms, fileTypes, limit) {
    const results = [];
    
    if (!fs.existsSync(dirPath)) return results;

    try {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            if (results.length >= limit) break;

            try {
                const itemPath = path.join(dirPath, item);
                const stats = fs.statSync(itemPath);

                if (stats.isDirectory()) {
                    // Search in subdirectories
                    const subResults = await searchDirectory(itemPath, searchTerms, fileTypes, limit - results.length);
                    results.push(...subResults);
                } else {
                    const ext = path.extname(item).toLowerCase();
                    const itemName = item.toLowerCase();
                    
                    // Check if matches file type filter
                    if (fileTypes.includes('all') || fileTypes.includes(ext.replace('.', ''))) {
                        // Calculate relevance
                        let relevance = 0;
                        let matches = 0;

                        searchTerms.forEach(term => {
                            if (itemName.includes(term)) {
                                matches++;
                                relevance += term.length;
                                if (itemName.startsWith(term)) relevance += 10; // Boost for prefix match
                                if (itemName === term) relevance += 50; // Exact match
                            }
                        });

                        if (matches > 0) {
                            const metadata = await getQuickMetadata(itemPath);
                            results.push({
                                name: item,
                                path: itemPath,
                                type: SUPPORTED_FORMATS.includes(ext) && ext.match(/\.(jpg|jpeg|png|gif|webp)/i) ? 'image' : 'file',
                                extension: ext,
                                relevance,
                                metadata,
                                query: searchTerms.join(' ')
                            });
                        }
                    }
                }
            } catch (error) {
                // Skip items that can't be accessed
            }
        }
    } catch (error) {
        // Skip directories that can't be accessed
    }

    return results;
}

/**
 * Helper: Get quick metadata
 */
async function getQuickMetadata(filePath) {
    try {
        const stats = fs.statSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        if (ext.match(/\.(jpg|jpeg|png|gif|webp|bmp)/i)) {
            const metadata = await imageProcessor.getImageMetadata(filePath);
            if (metadata) {
                return `${metadata.width}×${metadata.height}px • ${metadata.formatFileSize}`;
            }
        }
        
        return imageProcessor.formatFileSize(stats.size);
    } catch (error) {
        return '';
    }
}

/**
 * Helper: Get paths for apps
 */
function getPathsForApps(user, apps) {
    const paths = [];
    
    if (apps.includes('all')) {
        return Object.values(user.networkPaths || {}).filter(p => p);
    }

    const appPathMap = {
        'daily-plan': user.networkPaths?.dailyPlan,
        'gallery': user.networkPaths?.gallery,
        'dashboard': [user.networkPaths?.main, user.networkPaths?.extra, user.networkPaths?.kpi].filter(p => p)
    };

    apps.forEach(app => {
        const appPaths = appPathMap[app];
        if (appPaths) {
            paths.push(...(Array.isArray(appPaths) ? appPaths : [appPaths]));
        }
    });

    return paths.filter(p => p);
}

module.exports = router;
