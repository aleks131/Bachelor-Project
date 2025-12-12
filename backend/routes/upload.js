const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
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

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const { destination } = req.body;
            const uploadPath = destination ? path.normalize(destination) : path.join(__dirname, '../../uploads');
            
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|svg|mp4|webm|ogg|mov|avi|mkv|pdf|txt|json|csv/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    
    if (allowedTypes.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`File type .${ext} is not allowed`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    }
});

router.post('/single', requireAuth, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        res.json({
            success: true,
            file: {
                originalname: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed', message: error.message });
    }
});

router.post('/multiple', requireAuth, upload.array('files', 50), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const files = req.files.map(file => ({
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        }));

        res.json({
            success: true,
            files,
            count: files.length
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed', message: error.message });
    }
});

router.post('/chunk', requireAuth, (req, res) => {
    try {
        const { chunk, filename, chunkIndex, totalChunks, destination } = req.body;
        
        if (!chunk || !filename) {
            return res.status(400).json({ error: 'Chunk and filename required' });
        }

        const uploadDir = destination ? path.normalize(destination) : path.join(__dirname, '../../uploads');
        const chunkPath = path.join(uploadDir, `${filename}.chunk.${chunkIndex}`);

        fs.mkdir(uploadDir, { recursive: true }).then(() => {
            const buffer = Buffer.from(chunk, 'base64');
            return fs.writeFile(chunkPath, buffer);
        }).then(() => {
            if (parseInt(chunkIndex) === parseInt(totalChunks) - 1) {
                const finalPath = path.join(uploadDir, filename);
                return mergeChunks(uploadDir, filename, totalChunks, finalPath);
            }
            res.json({ success: true, chunkIndex });
        }).then(() => {
            res.json({ success: true, chunkIndex });
        }).catch(error => {
            res.status(500).json({ error: 'Chunk upload failed', message: error.message });
        });
    } catch (error) {
        console.error('Chunk upload error:', error);
        res.status(500).json({ error: 'Upload failed', message: error.message });
    }
});

async function mergeChunks(uploadDir, filename, totalChunks, finalPath) {
    const writeStream = require('fs').createWriteStream(finalPath);
    
    for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(uploadDir, `${filename}.chunk.${i}`);
        const chunkData = await fs.readFile(chunkPath);
        writeStream.write(chunkData);
        await fs.unlink(chunkPath);
    }
    
    writeStream.end();
}

module.exports = router;



