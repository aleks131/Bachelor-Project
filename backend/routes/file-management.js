const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const auth = require('../auth');

const router = express.Router();

const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        req.user = auth.getUserById(req.session.userId);
        if (req.user) {
            return next();
        }
    }
    res.status(401).json({ error: 'Authentication required' });
};

router.post('/copy', requireAuth, async (req, res) => {
    try {
        const { source, destination } = req.body;
        
        if (!source || !destination) {
            return res.status(400).json({ error: 'Source and destination are required' });
        }

        const sourcePath = path.normalize(source);
        const destPath = path.normalize(destination);

        const stats = await fs.stat(sourcePath);
        
        if (stats.isDirectory()) {
            await copyDirectory(sourcePath, destPath);
        } else {
            await fs.copyFile(sourcePath, destPath);
        }

        res.json({ success: true, message: 'File copied successfully' });
    } catch (error) {
        console.error('Error copying file:', error);
        res.status(500).json({ error: 'Failed to copy file', message: error.message });
    }
});

router.post('/move', requireAuth, async (req, res) => {
    try {
        const { source, destination } = req.body;
        
        if (!source || !destination) {
            return res.status(400).json({ error: 'Source and destination are required' });
        }

        const sourcePath = path.normalize(source);
        const destPath = path.normalize(destination);

        await fs.rename(sourcePath, destPath);

        res.json({ success: true, message: 'File moved successfully' });
    } catch (error) {
        console.error('Error moving file:', error);
        res.status(500).json({ error: 'Failed to move file', message: error.message });
    }
});

router.post('/rename', requireAuth, async (req, res) => {
    try {
        const { filePath, newName } = req.body;
        
        if (!filePath || !newName) {
            return res.status(400).json({ error: 'File path and new name are required' });
        }

        const fullPath = path.normalize(filePath);
        const dir = path.dirname(fullPath);
        const newPath = path.join(dir, newName);

        await fs.rename(fullPath, newPath);

        res.json({ success: true, message: 'File renamed successfully', newPath });
    } catch (error) {
        console.error('Error renaming file:', error);
        res.status(500).json({ error: 'Failed to rename file', message: error.message });
    }
});

router.post('/delete', requireAuth, async (req, res) => {
    try {
        const { filePath } = req.body;
        
        if (!filePath) {
            return res.status(400).json({ error: 'File path is required' });
        }

        const fullPath = path.normalize(filePath);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
            await fs.rmdir(fullPath, { recursive: true });
        } else {
            await fs.unlink(fullPath);
        }

        res.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file', message: error.message });
    }
});

router.post('/create-folder', requireAuth, async (req, res) => {
    try {
        const { folderPath, folderName } = req.body;
        
        if (!folderPath || !folderName) {
            return res.status(400).json({ error: 'Folder path and name are required' });
        }

        const fullPath = path.join(path.normalize(folderPath), folderName);
        await fs.mkdir(fullPath, { recursive: true });

        res.json({ success: true, message: 'Folder created successfully', path: fullPath });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ error: 'Failed to create folder', message: error.message });
    }
});

router.get('/preview', requireAuth, async (req, res) => {
    try {
        const { filePath } = req.query;
        
        if (!filePath) {
            return res.status(400).json({ error: 'File path is required' });
        }

        const fullPath = path.normalize(filePath);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
            return res.json({ type: 'directory', path: fullPath });
        }

        const ext = path.extname(fullPath).toLowerCase();
        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
        const textExts = ['.txt', '.json', '.csv', '.log', '.md'];

        let previewType = 'unknown';
        let content = null;

        if (imageExts.includes(ext)) {
            previewType = 'image';
            if (download) {
                return res.sendFile(fullPath);
            }
        } else if (videoExts.includes(ext)) {
            previewType = 'video';
            if (download) {
                return res.download(fullPath);
            }
        } else if (textExts.includes(ext)) {
            previewType = 'text';
            const textContent = await fs.readFile(fullPath, 'utf8');
            content = textContent.substring(0, 5000);
            if (download) {
                res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fullPath)}"`);
                return res.sendFile(fullPath);
            }
        }

        if (download) {
            return res.download(fullPath);
        }

        res.json({
            type: previewType,
            path: fullPath,
            size: stats.size,
            modified: stats.mtime,
            content
        });
    } catch (error) {
        console.error('Error previewing file:', error);
        res.status(500).json({ error: 'Failed to preview file', message: error.message });
    }
});

async function copyDirectory(source, destination) {
    await fs.mkdir(destination, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(sourcePath, destPath);
        } else {
            await fs.copyFile(sourcePath, destPath);
        }
    }
}

module.exports = router;
