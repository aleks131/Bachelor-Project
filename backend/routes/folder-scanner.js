const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('../../data/config.json');
const auth = require('../auth');

const router = express.Router();
const SUPPORTED_FORMATS = config.supportedFormats.map(f => f.toLowerCase());

function scanFolder(folderPath, maxDepth = 2, currentDepth = 0) {
    const results = {
        folders: [],
        files: [],
        totalFiles: 0,
        totalFolders: 0,
        totalSize: 0,
        images: 0,
        videos: 0,
        other: 0
    };

    try {
        if (!fs.existsSync(folderPath)) {
            return results;
        }

        const items = fs.readdirSync(folderPath);

        items.forEach(item => {
            try {
                const itemPath = path.join(folderPath, item);
                const stats = fs.statSync(itemPath);

                if (stats.isDirectory()) {
                    results.totalFolders++;
                    results.folders.push({
                        name: item,
                        path: itemPath,
                        size: 0,
                        fileCount: 0
                    });

                    if (currentDepth < maxDepth) {
                        const subResults = scanFolder(itemPath, maxDepth, currentDepth + 1);
                        results.totalFiles += subResults.totalFiles;
                        results.totalFolders += subResults.totalFolders;
                        results.totalSize += subResults.totalSize;
                        results.images += subResults.images;
                        results.videos += subResults.videos;
                        results.other += subResults.other;
                    }
                } else if (stats.isFile()) {
                    results.totalFiles++;
                    results.totalSize += stats.size;

                    const ext = path.extname(item).toLowerCase();
                    if (SUPPORTED_FORMATS.includes(ext)) {
                        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'].includes(ext);
                        const isVideo = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv'].includes(ext);

                        if (isImage) results.images++;
                        else if (isVideo) results.videos++;
                        else results.other++;

                        results.files.push({
                            name: item,
                            path: itemPath,
                            size: stats.size,
                            modified: stats.mtime.toISOString(),
                            extension: ext,
                            isImage,
                            isVideo
                        });
                    }
                }
            } catch (error) {
                console.error(`Error processing item ${item}:`, error.message);
            }
        });
    } catch (error) {
        console.error(`Error scanning folder ${folderPath}:`, error);
    }

    return results;
}

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

router.post('/scan', requireAuth, (req, res) => {
    const user = req.user;
    const { scanPath, maxDepth = 2 } = req.body;

    if (!scanPath) {
        return res.status(400).json({ error: 'Scan path is required' });
    }

    let actualPath;
    if (user.networkPaths) {
        if (scanPath.startsWith('main') && user.networkPaths.main) {
            actualPath = path.normalize(user.networkPaths.main);
        } else if (scanPath.startsWith('extra') && user.networkPaths.extra) {
            actualPath = path.normalize(user.networkPaths.extra);
        } else if (scanPath.startsWith('kpi') && user.networkPaths.kpi) {
            actualPath = path.normalize(user.networkPaths.kpi);
        } else {
            actualPath = path.normalize(scanPath);
        }
    } else {
        actualPath = path.normalize(scanPath);
    }

    if (!fs.existsSync(actualPath)) {
        return res.status(404).json({ error: 'Path does not exist' });
    }

    try {
        const results = scanFolder(actualPath, maxDepth);
        res.json({
            path: actualPath,
            scanResults: results
        });
    } catch (error) {
        console.error('Error scanning folder:', error);
        res.status(500).json({ error: 'Failed to scan folder', message: error.message });
    }
});

router.get('/browse', requireAuth, (req, res) => {
    const user = req.user;
    const { dir } = req.query;

    if (!dir) {
        return res.status(400).json({ error: 'Directory path is required' });
    }

    let actualPath;
    if (user.networkPaths) {
        if (dir === 'main' && user.networkPaths.main) {
            actualPath = path.normalize(user.networkPaths.main);
        } else if (dir === 'extra' && user.networkPaths.extra) {
            actualPath = path.normalize(user.networkPaths.extra);
        } else if (dir === 'kpi' && user.networkPaths.kpi) {
            actualPath = path.normalize(user.networkPaths.kpi);
        } else {
            actualPath = path.normalize(dir);
        }
    } else {
        actualPath = path.normalize(dir);
    }

    if (!fs.existsSync(actualPath)) {
        return res.status(404).json({ error: 'Directory does not exist' });
    }

    try {
        const items = fs.readdirSync(actualPath);
        const contents = {
            folders: [],
            files: []
        };

        items.forEach(item => {
            try {
                const itemPath = path.join(actualPath, item);
                const stats = fs.statSync(itemPath);

                if (stats.isDirectory()) {
                    contents.folders.push({
                        name: item,
                        path: itemPath,
                        relativePath: path.relative(actualPath, itemPath)
                    });
                } else {
                    const ext = path.extname(item).toLowerCase();
                    contents.files.push({
                        name: item,
                        path: itemPath,
                        relativePath: path.relative(actualPath, itemPath),
                        size: stats.size,
                        modified: stats.mtime.toISOString(),
                        extension: ext,
                        isImage: SUPPORTED_FORMATS.includes(ext) && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext),
                        isVideo: ['.mp4', '.webm', '.ogg', '.mov'].includes(ext)
                    });
                }
            } catch (error) {
                console.error(`Error processing item ${item}:`, error);
            }
        });

        res.json({
            path: actualPath,
            contents
        });
    } catch (error) {
        console.error('Error browsing folder:', error);
        res.status(500).json({ error: 'Failed to browse folder', message: error.message });
    }
});

module.exports = router;
