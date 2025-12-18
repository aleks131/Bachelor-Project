const express = require('express');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const config = require('../../data/config.json');

const router = express.Router();
const SUPPORTED_FORMATS = config.supportedFormats.map(f => f.toLowerCase());

function resolvePath(inputPath) {
    if (!inputPath) {
        return path.join(__dirname, '../../data/content/demo-images');
    }
    if (path.isAbsolute(inputPath)) {
        return path.normalize(inputPath);
    }
    return path.resolve(path.join(__dirname, '../../', inputPath));
}

function getMediaType(extension) {
    const videoFormats = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv'];
    return videoFormats.includes(extension.toLowerCase()) ? 'video' : 'image';
}

function getDashboardFiles(imagesDir, extraDir, kpiDir) {
    const data = {};
    
    const directories = [
        { path: imagesDir, key: 'main', name: 'Main' },
        { path: extraDir, key: 'extra', name: 'Extra' },
        { path: kpiDir, key: 'kpi', name: 'KPI' }
    ];
    
    directories.forEach(({ path: dirPath, key, name }) => {
        const absolutePath = resolvePath(dirPath);
        console.log(`[Dashboard] Checking ${name} path: ${dirPath} -> ${absolutePath}`);
        
        if (!absolutePath || !fs.existsSync(absolutePath)) {
            console.log(`[Dashboard] ${name} directory not found: ${absolutePath}`);
            return;
        }

        try {
            const rootFiles = fs.readdirSync(absolutePath)
                .filter(file => {
                    const filePath = path.join(absolutePath, file);
                    try {
                        const isFile = fs.statSync(filePath).isFile();
                        return isFile && SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase());
                    } catch(e) { return false; }
                })
                .map(file => {
                    const relativePath = key === 'main' ? file : `${key}/${file}`;
                    return {
                        name: file,
                        path: relativePath,
                        format: path.extname(file).toLowerCase().slice(1),
                        type: getMediaType(path.extname(file)),
                        fullPath: `/api/dashboard/images/${relativePath}`
                    };
                });

            if (rootFiles.length > 0) {
                data[key] = rootFiles;
                console.log(`[Dashboard] Found ${rootFiles.length} root files in ${name}`);
            }
            
            const folders = fs.readdirSync(absolutePath)
                .filter(item => {
                    const folderPath = path.join(absolutePath, item);
                    try {
                        return fs.statSync(folderPath).isDirectory();
                    } catch(e) { return false; }
                });
            
            console.log(`[Dashboard] Found folders in ${name}: ${folders.join(', ')}`);

            folders.forEach(folder => {
                const folderPath = path.join(absolutePath, folder);
                try {
                    const files = fs.readdirSync(folderPath)
                        .filter(file => SUPPORTED_FORMATS.includes(
                            path.extname(file).toLowerCase()
                        ))
                        .map(file => ({
                            name: file,
                            path: `${key}/${folder}/${file}`,
                            format: path.extname(file).toLowerCase().slice(1),
                            type: getMediaType(path.extname(file)),
                            fullPath: `/api/dashboard/images/${key}/${folder}/${encodeURIComponent(file)}`
                        }));
                    
                    if (files.length > 0) {
                        data[`${key}_${folder}`] = files;
                        console.log(`[Dashboard] Folder '${folder}' has ${files.length} valid files`);
                    }
                } catch (folderError) {
                    console.error(`Error reading folder ${folder}:`, folderError);
                }
            });
        } catch (error) {
            console.error(`Error reading ${name} directory:`, error);
        }
    });
    
    return data;
}

function setupDashboardWatcher(imagesDir, extraDir, kpiDir, wss) {
    const monitoring = require('../utils/monitoring');
    if (imagesDir) monitoring.trackFileWatcher(imagesDir, 'add');
    if (extraDir) monitoring.trackFileWatcher(extraDir, 'add');
    if (kpiDir) monitoring.trackFileWatcher(kpiDir, 'add');
    const watchPaths = [imagesDir, extraDir, kpiDir].filter(p => p && fs.existsSync(p));
    
    const watcher = chokidar.watch(watchPaths, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        },
        usePolling: true,
        interval: 1000,
        binaryInterval: 3000,
        alwaysStat: true,
        depth: 5,
        ignorePermissionErrors: true
    });

    watcher
        .on('add', filePath => handleFileChange('add', filePath, imagesDir, extraDir, kpiDir, wss))
        .on('change', filePath => handleFileChange('change', filePath, imagesDir, extraDir, kpiDir, wss))
        .on('unlink', filePath => handleFileChange('unlink', filePath, imagesDir, extraDir, kpiDir, wss))
        .on('addDir', folderPath => handleFolderChange('add', folderPath, imagesDir, extraDir, kpiDir, wss))
        .on('unlinkDir', folderPath => handleFolderChange('remove', folderPath, imagesDir, extraDir, kpiDir, wss));

    return watcher;
}

function handleFileChange(eventType, filePath, imagesDir, extraDir, kpiDir, wss) {
    let context = 'main';
    let baseDir = imagesDir;
    
    if (extraDir && filePath.startsWith(extraDir)) {
        context = 'extra';
        baseDir = extraDir;
    } else if (kpiDir && filePath.startsWith(kpiDir)) {
        context = 'kpi';
        baseDir = kpiDir;
    }
    
    const relativePath = path.relative(baseDir, filePath);
    
    const message = {
        type: 'fileChanged',
        event: eventType,
        path: relativePath,
        context: context,
        timestamp: new Date().toISOString()
    };
    
    broadcastToDashboard(wss, message);
}

function handleFolderChange(eventType, folderPath, imagesDir, extraDir, kpiDir, wss) {
    let context = 'main';
    let baseDir = imagesDir;
    
    if (extraDir && folderPath.startsWith(extraDir)) {
        context = 'extra';
        baseDir = extraDir;
    } else if (kpiDir && folderPath.startsWith(kpiDir)) {
        context = 'kpi';
        baseDir = kpiDir;
    }
    
    const relativePath = path.relative(baseDir, folderPath);
    
    const message = {
        type: 'FOLDER_UPDATED',
        event: eventType,
        path: relativePath,
        context: context
    };
    
    broadcastToDashboard(wss, message);
}

function broadcastToDashboard(wss, message) {
    if (!wss || !wss.clients) return;
    
    const monitoring = require('../utils/monitoring');
    let sentCount = 0;
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.appType === 'dashboard') {
            try {
                client.send(JSON.stringify(message));
                monitoring.trackWebSocketMessage(client, 'sent');
                sentCount++;
            } catch (error) {
                monitoring.logError(error, { context: 'Dashboard broadcast', messageType: message.type });
                console.error('Error broadcasting to dashboard client:', error);
            }
        }
    });
    
    if (sentCount > 0) {
        console.log(`Broadcasted ${message.type} to ${sentCount} dashboard client(s)`);
    }
}

router.get('/images', (req, res) => {
    const user = req.user;
    if (!user || !user.networkPaths) {
        return res.status(403).json({ error: 'User network paths not configured' });
    }

    const imagesDir = user.networkPaths.main || 'data/content/demo-images';
    const extraDir = user.networkPaths.extra || 'data/content/demo-images';
    const kpiDir = user.networkPaths.kpi || 'data/content/demo-images/kpi';

    try {
        const data = getDashboardFiles(imagesDir, extraDir, kpiDir);
        res.json(data);
    } catch (error) {
        console.error('Error serving dashboard files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

router.get('/images/*', (req, res) => {
    const user = req.user;
    const filePath = req.params[0];
    
    const imagesDir = resolvePath(user.networkPaths.main || 'data/content/demo-images');
    const extraDir = resolvePath(user.networkPaths.extra || 'data/content/demo-images');
    const kpiDir = resolvePath(user.networkPaths.kpi || 'data/content/demo-images/kpi');
    
    let fullPath = null;
    
    if (filePath.startsWith('extra/')) {
        fullPath = path.join(extraDir, filePath.replace('extra/', ''));
    } else if (filePath.startsWith('kpi/')) {
        fullPath = path.join(kpiDir, filePath.replace('kpi/', ''));
    } else {
        fullPath = path.join(imagesDir, filePath);
    }
    
    console.log(`[Dashboard] Serving file: ${filePath} -> ${fullPath}`);
    
    if (fullPath && fs.existsSync(fullPath)) {
        res.sendFile(fullPath);
    } else {
        console.error(`[Dashboard] File not found: ${fullPath}`);
        res.status(404).send('File not found');
    }
});

router.get('/kpi', (req, res) => {
    const data = {
        people: [
            { id: 'kpi-people-1', title: 'KPI 5', value: '95%', status: 'blue' },
            { id: 'kpi-people-2', title: 'KPI 6', value: '87%', status: 'blue' },
            { id: 'kpi-people-3', title: 'KPI 7', value: '92%', status: 'blue' },
            { id: 'kpi-people-4', title: 'KPI 8', value: '78%', status: 'blue' }
        ],
        customer: [
            { id: 'kpi-customer-1', title: 'KPI 9', value: '4.8', status: 'blue' },
            { id: 'kpi-customer-2', title: 'KPI 10', value: '98%', status: 'blue' },
            { id: 'kpi-customer-3', title: 'KPI 11', value: '0.5%', status: 'blue' },
            { id: 'kpi-customer-4', title: 'KPI 12', value: '1.2%', status: 'red' }
        ],
        cost: [
            { id: 'kpi-cost-1', title: 'KPI 13', value: '€2.3M', status: 'blue' },
            { id: 'kpi-cost-2', title: 'KPI 14', value: '€1.8M', status: 'blue' },
            { id: 'kpi-cost-3', title: 'KPI 15', value: '€4.2M', status: 'blue' },
            { id: 'kpi-cost-4', title: 'KPI 16', value: '2.5%', status: 'blue' }
        ],
        production: [
            { id: 'kpi-1', title: 'KPI 2', value: '95%', status: 'yellow' },
            { id: 'kpi-2', title: 'KPI 3', value: '88%', status: 'yellow' },
            { id: 'kpi-3', title: 'KPI 4', value: '91%', status: 'normal' },
            { id: 'kpi-4', title: 'KPI 17', value: '76%', status: 'yellow' }
        ]
    };
    
    res.json(data);
});

router.get('/files', (req, res) => {
    const user = req.user;
    const directory = req.query.dir || 'main';
    
    let basePath;
    if (directory === 'extra') {
        basePath = resolvePath(user.networkPaths.extra || 'data/content/demo-images');
    } else if (directory === 'kpi-meeting' || directory === 'kpi') {
        basePath = resolvePath(user.networkPaths.kpi || 'data/content/demo-images/kpi');
    } else {
        basePath = resolvePath(user.networkPaths.main || 'data/content/demo-images');
    }
    
    console.log(`[Dashboard] Loading files from: ${directory} -> ${basePath}`);
    
    try {
        if (!fs.existsSync(basePath)) {
            console.error(`[Dashboard] Directory not found: ${basePath}`);
            return res.status(404).json({ error: 'Directory not found', path: basePath });
        }
        
        const dirContents = fs.readdirSync(basePath);
        const files = dirContents
            .filter(file => {
                try {
                    const filePath = path.join(basePath, file);
                    const isFile = fs.statSync(filePath).isFile();
                    const ext = path.extname(file).toLowerCase();
                    return isFile && SUPPORTED_FORMATS.includes(ext);
                } catch {
                    return false;
                }
            })
            .map(file => {
                const filePath = path.join(basePath, file);
                const stats = fs.statSync(filePath);
                const fileExt = path.extname(file).toLowerCase();
                
                return {
                    name: file,
                    path: file,
                    fullPath: `/api/dashboard/images/${directory === 'main' ? '' : directory + '/'}${encodeURIComponent(file)}`,
                    size: stats.size,
                    modified: stats.mtime.toISOString(),
                    isImage: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp', '.tiff'].includes(fileExt),
                    isVideo: ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv'].includes(fileExt),
                    extension: fileExt
                };
            })
            .filter(file => file !== null);
        
        files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        
        res.json({ 
            directory: {
                name: directory || 'main',
                path: basePath,
                count: files.length,
                exists: true,
                isAccessible: true
            },
            files 
        });
    } catch (error) {
        console.error('Error processing directory request:', error);
        res.status(500).json({ 
            error: 'Failed to read directory',
            message: error.message
        });
    }
});

module.exports = { router, setupDashboardWatcher };
