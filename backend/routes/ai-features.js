const express = require('express');
const path = require('path');
const fs = require('fs');
const aiAnalyzer = require('../utils/ai-image-analyzer');

const router = express.Router();

const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        req.user = require('../auth').getUserById(req.session.userId);
        if (req.user) {
            return next();
        }
    }
    res.status(401).json({ error: 'Authentication required' });
};

router.post('/analyze-color', requireAuth, async (req, res) => {
    try {
        const { imagePath, numColors } = req.body;
        
        if (!imagePath) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        const fullPath = path.normalize(imagePath);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const palette = await aiAnalyzer.extractColorPalette(fullPath, numColors || 5);
        
        if (!palette) {
            return res.status(500).json({ error: 'Failed to extract colors' });
        }

        res.json({ palette });
    } catch (error) {
        console.error('Error analyzing colors:', error);
        res.status(500).json({ error: 'Failed to analyze colors', message: error.message });
    }
});

router.post('/find-duplicates', requireAuth, async (req, res) => {
    try {
        const { imagePaths, threshold } = req.body;
        
        if (!Array.isArray(imagePaths) || imagePaths.length < 2) {
            return res.status(400).json({ error: 'At least 2 image paths required' });
        }

        const duplicates = await aiAnalyzer.findDuplicates(
            imagePaths.map(p => path.normalize(p)),
            threshold || 95
        );

        res.json({ duplicates, count: duplicates.length });
    } catch (error) {
        console.error('Error finding duplicates:', error);
        res.status(500).json({ error: 'Failed to find duplicates', message: error.message });
    }
});

router.post('/analyze-content', requireAuth, async (req, res) => {
    try {
        const { imagePath } = req.body;
        
        if (!imagePath) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        const fullPath = path.normalize(imagePath);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const analysis = await aiAnalyzer.analyzeImageContent(fullPath);
        
        if (!analysis) {
            return res.status(500).json({ error: 'Failed to analyze image' });
        }

        res.json({ analysis });
    } catch (error) {
        console.error('Error analyzing content:', error);
        res.status(500).json({ error: 'Failed to analyze content', message: error.message });
    }
});

router.post('/find-similar', requireAuth, async (req, res) => {
    try {
        const { targetImage, candidateImages, threshold } = req.body;
        
        if (!targetImage || !Array.isArray(candidateImages)) {
            return res.status(400).json({ error: 'Target image and candidate images required' });
        }

        const similar = await aiAnalyzer.findSimilarImages(
            path.normalize(targetImage),
            candidateImages.map(p => path.normalize(p)),
            threshold || 85
        );

        res.json({ similar, count: similar.length });
    } catch (error) {
        console.error('Error finding similar images:', error);
        res.status(500).json({ error: 'Failed to find similar images', message: error.message });
    }
});

router.post('/batch-analyze', requireAuth, async (req, res) => {
    try {
        const { imagePaths } = req.body;
        
        if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
            return res.status(400).json({ error: 'Image paths array is required' });
        }

        const results = await aiAnalyzer.batchAnalyze(
            imagePaths.map(p => path.normalize(p))
        );

        res.json({ results, total: results.length, successful: results.filter(r => r.success).length });
    } catch (error) {
        console.error('Error batch analyzing:', error);
        res.status(500).json({ error: 'Failed to batch analyze', message: error.message });
    }
});

router.get('/characteristics', requireAuth, async (req, res) => {
    try {
        const { imagePath } = req.query;
        
        if (!imagePath) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        const fullPath = path.normalize(imagePath);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const characteristics = await aiAnalyzer.getImageCharacteristics(fullPath);
        
        if (!characteristics) {
            return res.status(500).json({ error: 'Failed to get characteristics' });
        }

        res.json({ characteristics });
    } catch (error) {
        console.error('Error getting characteristics:', error);
        res.status(500).json({ error: 'Failed to get characteristics', message: error.message });
    }
});

router.post('/extract-text', requireAuth, async (req, res) => {
    try {
        const { imagePath, language, force } = req.body;
        
        if (!imagePath) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        const fullPath = path.normalize(imagePath);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const ocrResult = await aiAnalyzer.extractText(fullPath, { 
            language: language || 'eng',
            force: force || false
        });
        
        res.json({ ocr: ocrResult });
    } catch (error) {
        console.error('Error extracting text:', error);
        res.status(500).json({ error: 'Failed to extract text', message: error.message });
    }
});

router.post('/batch-extract-text', requireAuth, async (req, res) => {
    try {
        const { imagePaths, language } = req.body;
        
        if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
            return res.status(400).json({ error: 'Image paths array is required' });
        }

        const results = await aiAnalyzer.batchExtractText(
            imagePaths.map(p => path.normalize(p)),
            { language: language || 'eng' }
        );

        res.json({ 
            results, 
            total: results.length, 
            successful: results.filter(r => r.success).length 
        });
    } catch (error) {
        console.error('Error batch extracting text:', error);
        res.status(500).json({ error: 'Failed to batch extract text', message: error.message });
    }
});

module.exports = router;



