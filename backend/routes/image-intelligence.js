const express = require('express');
const fs = require('fs');
const path = require('path');
const imageProcessor = require('../utils/image-processor');
const auth = require('../auth');

const router = express.Router();

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
 * Get image metadata
 */
router.get('/metadata', requireAuth, async (req, res) => {
    try {
        const { imagePath } = req.query;
        
        if (!imagePath) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        let actualPath;
        if (imagePath.startsWith('/images/')) {
            actualPath = path.join(__dirname, '../../', imagePath);
        } else {
            actualPath = path.normalize(imagePath);
        }

        if (!fs.existsSync(actualPath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const metadata = await imageProcessor.getImageMetadata(actualPath);
        
        if (!metadata) {
            return res.status(500).json({ error: 'Failed to read image metadata' });
        }

        res.json({ metadata });
    } catch (error) {
        console.error('Error getting image metadata:', error);
        res.status(500).json({ error: 'Failed to process image', message: error.message });
    }
});

/**
 * Get optimized image URL
 */
router.get('/optimized', requireAuth, async (req, res) => {
    try {
        const { imagePath, width, height, quality, format } = req.query;
        
        if (!imagePath) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        let actualPath;
        if (imagePath.startsWith('/images/')) {
            actualPath = path.join(__dirname, '../../', imagePath);
        } else {
            actualPath = path.normalize(imagePath);
        }

        if (!fs.existsSync(actualPath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const optimizedPath = await imageProcessor.optimizeImage(actualPath, {
            maxWidth: parseInt(width) || 1920,
            maxHeight: parseInt(height) || 1080,
            quality: parseInt(quality) || 85,
            format: format || 'jpeg'
        });

        // Return relative path for serving
        const relativePath = path.relative(path.join(__dirname, '../../'), optimizedPath);
        res.json({ 
            optimizedPath: `/${relativePath.replace(/\\/g, '/')}`,
            original: imagePath,
            cached: fs.existsSync(optimizedPath)
        });
    } catch (error) {
        console.error('Error optimizing image:', error);
        res.status(500).json({ error: 'Failed to optimize image', message: error.message });
    }
});

/**
 * Get thumbnail URL
 */
router.get('/thumbnail', requireAuth, async (req, res) => {
    try {
        const { imagePath, width = 300, height = 300, quality = 80 } = req.query;
        
        if (!imagePath) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        let actualPath;
        if (imagePath.startsWith('/images/')) {
            actualPath = path.join(__dirname, '../../', imagePath);
        } else {
            actualPath = path.normalize(imagePath);
        }

        if (!fs.existsSync(actualPath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const thumbnailPath = await imageProcessor.generateThumbnail(actualPath, {
            width: parseInt(width),
            height: parseInt(height),
            quality: parseInt(quality)
        });

        if (!thumbnailPath) {
            return res.status(500).json({ error: 'Failed to generate thumbnail' });
        }

        const relativePath = path.relative(path.join(__dirname, '../../'), thumbnailPath);
        res.json({ 
            thumbnailPath: `/${relativePath.replace(/\\/g, '/')}`,
            cached: true
        });
    } catch (error) {
        console.error('Error generating thumbnail:', error);
        res.status(500).json({ error: 'Failed to generate thumbnail', message: error.message });
    }
});

/**
 * Calculate best fit for container
 */
router.post('/best-fit', requireAuth, async (req, res) => {
    try {
        const { imagePath, containerWidth, containerHeight } = req.body;
        
        if (!imagePath || !containerWidth || !containerHeight) {
            return res.status(400).json({ error: 'Image path and container dimensions are required' });
        }

        let actualPath;
        if (imagePath.startsWith('/images/')) {
            actualPath = path.join(__dirname, '../../', imagePath);
        } else {
            actualPath = path.normalize(imagePath);
        }

        if (!fs.existsSync(actualPath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const metadata = await imageProcessor.getImageMetadata(actualPath);
        if (!metadata) {
            return res.status(500).json({ error: 'Failed to read image metadata' });
        }

        const bestFit = imageProcessor.calculateBestFit(
            metadata,
            parseInt(containerWidth),
            parseInt(containerHeight)
        );

        res.json({
            metadata,
            bestFit,
            recommendations: {
                displayMode: bestFit.displayMode,
                useThumbnail: metadata.width > containerWidth * 2 || metadata.height > containerHeight * 2,
                optimizeForWeb: metadata.size > 500000, // 500KB
                suggestedFormat: metadata.size > 1000000 ? 'webp' : 'jpeg'
            }
        });
    } catch (error) {
        console.error('Error calculating best fit:', error);
        res.status(500).json({ error: 'Failed to calculate best fit', message: error.message });
    }
});

/**
 * Batch process images
 */
router.post('/batch/metadata', requireAuth, async (req, res) => {
    try {
        const { imagePaths } = req.body;
        
        if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
            return res.status(400).json({ error: 'Array of image paths is required' });
        }

        const results = await Promise.all(
            imagePaths.map(async (imagePath) => {
                try {
                    let actualPath = imagePath.startsWith('/images/') 
                        ? path.join(__dirname, '../../', imagePath)
                        : path.normalize(imagePath);

                    if (!fs.existsSync(actualPath)) {
                        return { path: imagePath, error: 'Not found' };
                    }

                    const metadata = await imageProcessor.getImageMetadata(actualPath);
                    return { path: imagePath, metadata };
                } catch (error) {
                    return { path: imagePath, error: error.message };
                }
            })
        );

        res.json({ results });
    } catch (error) {
        console.error('Error batch processing:', error);
        res.status(500).json({ error: 'Failed to batch process', message: error.message });
    }
});

/**
 * Detect image orientation
 */
router.get('/orientation', requireAuth, async (req, res) => {
    try {
        const { imagePath } = req.query;
        
        if (!imagePath) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        let actualPath = imagePath.startsWith('/images/') 
            ? path.join(__dirname, '../../', imagePath)
            : path.normalize(imagePath);

        if (!fs.existsSync(actualPath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const orientation = await imageProcessor.detectOrientation(actualPath);
        res.json(orientation);
    } catch (error) {
        console.error('Error detecting orientation:', error);
        res.status(500).json({ error: 'Failed to detect orientation', message: error.message });
    }
});

module.exports = router;
