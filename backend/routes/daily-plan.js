const express = require('express');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const config = require('../../data/config.json');

const router = express.Router();
const SUPPORTED_FORMATS = config.supportedFormats.map(f => f.toLowerCase());

function getMediaType(extension) {
    const videoFormats = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv'];
    return videoFormats.includes(extension.toLowerCase()) ? 'video' : 'image';
}

function getDailyPlanImages(imagesDir) {
    const data = {};
    try {
        if (!fs.existsSync(imagesDir)) {
            console.error(`Daily Plan images directory not found: ${imagesDir}`);
            return data;
        }

        const folders = fs.readdirSync(imagesDir)
            .filter(item => {
                const folderPath = path.join(imagesDir, item);
                return fs.statSync(folderPath).isDirectory();
            });
        
        folders.forEach(folder => {
            const folderPath = path.join(imagesDir, folder);
            try {
                const files = fs.readdirSync(folderPath)
                    .filter(file => SUPPORTED_FORMATS.includes(
                        path.extname(file).toLowerCase()
                    ))
                    .map(file => ({
                        name: file,
                        path: path.join(folder, file).replace(/\\/g, '/'),
                        format: path.extname(file).toLowerCase().slice(1),
                        type: getMediaType(path.extname(file)),
                        fullPath: `/api/daily-plan/images/${folder}/${encodeURIComponent(file)}`
                    }));
                
                if (files.length > 0) {
                    data[folder] = files;
                }
            } catch (folderError) {
                console.error(`Error reading folder ${folder}:`, folderError);
            }
        });
    } catch (error) {
        console.error('Error reading daily plan images:', error);
    }
    return data;
}

function setupDailyPlanWatcher(imagesDir, wss) {
    const monitoring = require('../utils/monitoring');
    monitoring.trackFileWatcher(imagesDir, 'add');
    const watcher = chokidar.watch(imagesDir, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 100
        },
        usePolling: false,
        interval: 1000,
        binaryInterval: 3000,
        alwaysStat: true,
        depth: 1,
        ignorePermissionErrors: true
    });

    watcher
        .on('add', filePath => handleFileChange('add', filePath, imagesDir, wss))
        .on('change', filePath => handleFileChange('change', filePath, imagesDir, wss))
        .on('unlink', filePath => handleFileChange('unlink', filePath, imagesDir, wss))
        .on('addDir', folderPath => handleFolderChange('add', folderPath, imagesDir, wss))
        .on('unlinkDir', folderPath => handleFolderChange('remove', folderPath, imagesDir, wss));

    return watcher;
}

function handleFileChange(eventType, filePath, imagesDir, wss) {
    const relativePath = path.relative(imagesDir, filePath);
    const folder = path.dirname(relativePath).split(path.sep)[0];
    
    const message = {
        type: 'IMAGES_UPDATED',
        event: eventType,
        path: relativePath,
        folder: folder
    };
    
    broadcastToDailyPlan(wss, message);
}

function handleFolderChange(eventType, folderPath, imagesDir, wss) {
    const relativePath = path.relative(imagesDir, folderPath);
    if (!relativePath.includes(path.sep)) {
        const message = {
            type: 'FOLDER_UPDATED',
            event: eventType,
            path: relativePath
        };
        
        broadcastToDailyPlan(wss, message);
    }
}

function broadcastToDailyPlan(wss, message) {
    if (!wss || !wss.clients) return;
    
    const monitoring = require('../utils/monitoring');
    let sentCount = 0;
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.appType === 'daily-plan') {
            try {
                client.send(JSON.stringify(message));
                monitoring.trackWebSocketMessage(client, 'sent');
                sentCount++;
            } catch (error) {
                monitoring.logError(error, { context: 'Daily Plan broadcast', messageType: message.type });
                console.error('Error broadcasting to daily-plan client:', error);
            }
        }
    });
    
    if (sentCount > 0) {
        console.log(`Broadcasted ${message.type} to ${sentCount} daily-plan client(s)`);
    }
}

router.get('/images', (req, res) => {
    const user = req.user;
    if (!user || !user.networkPaths) {
        return res.status(403).json({ error: 'User network paths not configured' });
    }

    let imagesDir;
    if (user.networkPaths.dailyPlan) {
        imagesDir = path.normalize(user.networkPaths.dailyPlan);
    } else if (user.networkPaths.main) {
        imagesDir = path.normalize(user.networkPaths.main);
    } else {
        imagesDir = path.join(__dirname, '../../images');
    }

    try {
        const data = getDailyPlanImages(imagesDir);
        res.json(data);
    } catch (error) {
        console.error('Error serving daily plan images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

router.get('/images/:folder/:filename', (req, res) => {
    const user = req.user;
    const { folder, filename } = req.params;
    
    let imagesDir;
    if (user.networkPaths.dailyPlan) {
        imagesDir = path.normalize(user.networkPaths.dailyPlan);
    } else if (user.networkPaths.main) {
        imagesDir = path.normalize(user.networkPaths.main);
    } else {
        imagesDir = path.join(__dirname, '../../images');
    }
    
    const filePath = path.join(imagesDir, folder, decodeURIComponent(filename));
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

module.exports = { router, setupDailyPlanWatcher };
