const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Tesseract = require('tesseract.js');

class AIImageAnalyzer {
    constructor() {
        this.cacheDir = path.join(__dirname, '../../data/ai-cache');
        this.ensureCacheDir();
    }

    ensureCacheDir() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    getCachePath(imagePath, analysisType) {
        const hash = this.getFileHash(imagePath);
        return path.join(this.cacheDir, `${hash}_${analysisType}.json`);
    }

    getFileHash(filePath) {
        const stats = fs.statSync(filePath);
        return crypto.createHash('md5')
            .update(filePath + stats.mtime.getTime())
            .digest('hex');
    }

    async extractColorPalette(imagePath, numColors = 5) {
        try {
            const cachePath = this.getCachePath(imagePath, 'colors');
            if (fs.existsSync(cachePath)) {
                return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            }

            const image = sharp(imagePath);
            const { width, height } = await image.metadata();
            
            const resized = await image
                .resize(100, 100, { fit: 'cover' })
                .raw()
                .toBuffer({ resolveWithObject: true });

            const pixels = resized.data;
            const colorMap = new Map();

            for (let i = 0; i < pixels.length; i += 3) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                const key = `${Math.floor(r / 10) * 10}_${Math.floor(g / 10) * 10}_${Math.floor(b / 10) * 10}`;
                colorMap.set(key, (colorMap.get(key) || 0) + 1);
            }

            const sortedColors = Array.from(colorMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, numColors)
                .map(([key, count]) => {
                    const [r, g, b] = key.split('_').map(Number);
                    return {
                        r, g, b,
                        hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
                        percentage: (count / (pixels.length / 3)) * 100
                    };
                });

            const dominant = sortedColors[0];
            const isDark = (dominant.r + dominant.g + dominant.b) / 3 < 128;

            const result = {
                colors: sortedColors,
                dominant: dominant,
                isDark,
                colorTemperature: this.getColorTemperature(dominant),
                primaryColor: this.getColorName(dominant)
            };

            fs.writeFileSync(cachePath, JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error('Error extracting color palette:', error);
            return null;
        }
    }

    getColorTemperature(color) {
        const { r, g, b } = color;
        const avg = (r + g + b) / 3;
        
        if (r > b && r > g) return 'warm';
        if (b > r && b > g) return 'cool';
        if (avg < 100) return 'dark';
        if (avg > 200) return 'light';
        return 'neutral';
    }

    getColorName(color) {
        const { r, g, b } = color;
        
        if (r > 200 && g > 200 && b > 200) return 'white';
        if (r < 50 && g < 50 && b < 50) return 'black';
        if (r > g && r > b) return 'red';
        if (g > r && g > b) return 'green';
        if (b > r && b > g) return 'blue';
        if (r > 200 && g > 200) return 'yellow';
        if (g > 200 && b > 200) return 'cyan';
        if (r > 200 && b > 200) return 'magenta';
        
        return 'gray';
    }

    async generateImageHash(imagePath) {
        try {
            const cachePath = this.getCachePath(imagePath, 'hash');
            if (fs.existsSync(cachePath)) {
                return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            }

            const image = sharp(imagePath);
            const resized = await image
                .resize(8, 8, { fit: 'cover' })
                .greyscale()
                .raw()
                .toBuffer({ resolveWithObject: true });

            const pixels = resized.data;
            const avg = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;
            
            let hash = '';
            for (let i = 0; i < pixels.length; i++) {
                hash += pixels[i] > avg ? '1' : '0';
            }

            const result = {
                hash,
                type: 'perceptual',
                similarity: null
            };

            fs.writeFileSync(cachePath, JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error('Error generating image hash:', error);
            return null;
        }
    }

    calculateSimilarity(hash1, hash2) {
        if (!hash1 || !hash2 || hash1.length !== hash2.length) {
            return 0;
        }

        let differences = 0;
        for (let i = 0; i < hash1.length; i++) {
            if (hash1[i] !== hash2[i]) {
                differences++;
            }
        }

        const similarity = ((hash1.length - differences) / hash1.length) * 100;
        return Math.round(similarity * 100) / 100;
    }

    async findDuplicates(imagePaths, threshold = 95) {
        try {
            const hashes = [];
            
            for (const imagePath of imagePaths) {
                const hashData = await this.generateImageHash(imagePath);
                if (hashData) {
                    hashes.push({
                        path: imagePath,
                        hash: hashData.hash
                    });
                }
            }

            const duplicates = [];
            const processed = new Set();

            for (let i = 0; i < hashes.length; i++) {
                if (processed.has(i)) continue;

                const group = [hashes[i].path];
                
                for (let j = i + 1; j < hashes.length; j++) {
                    if (processed.has(j)) continue;

                    const similarity = this.calculateSimilarity(hashes[i].hash, hashes[j].hash);
                    
                    if (similarity >= threshold) {
                        group.push(hashes[j].path);
                        processed.add(j);
                    }
                }

                if (group.length > 1) {
                    duplicates.push({
                        group,
                        similarity: threshold,
                        count: group.length
                    });
                    processed.add(i);
                }
            }

            return duplicates;
        } catch (error) {
            console.error('Error finding duplicates:', error);
            return [];
        }
    }

    async analyzeImageContent(imagePath) {
        try {
            const cachePath = this.getCachePath(imagePath, 'content');
            if (fs.existsSync(cachePath)) {
                return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            }

            const metadata = await sharp(imagePath).metadata();
            const colors = await this.extractColorPalette(imagePath);
            const hash = await this.generateImageHash(imagePath);

            const tags = [];
            const features = {
                hasText: false,
                isPhoto: metadata.format !== 'svg',
                isVector: metadata.format === 'svg',
                isScreenshot: false,
                complexity: 'medium'
            };

            if (metadata.width && metadata.height) {
                const aspectRatio = metadata.width / metadata.height;
                
                if (Math.abs(aspectRatio - 16/9) < 0.1) {
                    tags.push('wide-screen');
                }
                if (Math.abs(aspectRatio - 1) < 0.1) {
                    tags.push('square');
                }
                if (aspectRatio > 1) {
                    tags.push('landscape');
                } else {
                    tags.push('portrait');
                }
            }

            if (colors) {
                tags.push(colors.primaryColor);
                tags.push(colors.colorTemperature);
            }

            if (metadata.width > 1920 || metadata.height > 1080) {
                tags.push('high-resolution');
            }

            const result = {
                tags,
                features,
                colors,
                hash: hash?.hash,
                metadata: {
                    width: metadata.width,
                    height: metadata.height,
                    format: metadata.format
                }
            };

            fs.writeFileSync(cachePath, JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error('Error analyzing image content:', error);
            return null;
        }
    }

    async batchAnalyze(imagePaths) {
        const results = [];
        
        for (const imagePath of imagePaths) {
            try {
                const analysis = await this.analyzeImageContent(imagePath);
                results.push({
                    path: imagePath,
                    analysis,
                    success: true
                });
            } catch (error) {
                results.push({
                    path: imagePath,
                    error: error.message,
                    success: false
                });
            }
        }

        return results;
    }

    async findSimilarImages(targetImagePath, candidatePaths, threshold = 85) {
        try {
            const targetHash = await this.generateImageHash(targetImagePath);
            if (!targetHash) return [];

            const similar = [];
            
            for (const candidatePath of candidatePaths) {
                const candidateHash = await this.generateImageHash(candidatePath);
                if (!candidateHash) continue;

                const similarity = this.calculateSimilarity(targetHash.hash, candidateHash.hash);
                
                if (similarity >= threshold) {
                    similar.push({
                        path: candidatePath,
                        similarity
                    });
                }
            }

            return similar.sort((a, b) => b.similarity - a.similarity);
        } catch (error) {
            console.error('Error finding similar images:', error);
            return [];
        }
    }

    async extractDominantColors(imagePath) {
        const palette = await this.extractColorPalette(imagePath);
        return palette?.colors || [];
    }

    async getImageCharacteristics(imagePath) {
        try {
            const [metadata, colors, hash] = await Promise.all([
                sharp(imagePath).metadata(),
                this.extractColorPalette(imagePath),
                this.generateImageHash(imagePath)
            ]);

            return {
                dimensions: {
                    width: metadata.width,
                    height: metadata.height,
                    aspectRatio: metadata.width / metadata.height
                },
                colors: colors?.colors || [],
                dominantColor: colors?.dominant,
                hash: hash?.hash,
                format: metadata.format,
                size: fs.statSync(imagePath).size
            };
        } catch (error) {
            console.error('Error getting image characteristics:', error);
            return null;
        }
    }

    async extractText(imagePath, options = {}) {
        try {
            const cachePath = this.getCachePath(imagePath, 'ocr');
            if (fs.existsSync(cachePath) && !options.force) {
                return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            }

            const {
                data: { text, confidence, words, lines, paragraphs }
            } = await Tesseract.recognize(imagePath, options.language || 'eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                }
            });

            const result = {
                text: text.trim(),
                confidence: Math.round(confidence),
                wordCount: words.length,
                lineCount: lines.length,
                paragraphCount: paragraphs.length,
                words: words.map(w => ({
                    text: w.text,
                    confidence: Math.round(w.confidence),
                    bbox: w.bbox
                })),
                lines: lines.map(l => ({
                    text: l.text,
                    confidence: Math.round(l.confidence)
                })),
                paragraphs: paragraphs.map(p => ({
                    text: p.text,
                    confidence: Math.round(p.confidence)
                })),
                extractedAt: new Date().toISOString()
            };

            fs.writeFileSync(cachePath, JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error('Error extracting text:', error);
            return {
                text: '',
                confidence: 0,
                error: error.message,
                wordCount: 0,
                lineCount: 0,
                paragraphCount: 0
            };
        }
    }

    async batchExtractText(imagePaths, options = {}) {
        const results = [];
        
        for (const imagePath of imagePaths) {
            try {
                const ocrResult = await this.extractText(imagePath, options);
                results.push({
                    path: imagePath,
                    ocr: ocrResult,
                    success: true
                });
            } catch (error) {
                results.push({
                    path: imagePath,
                    error: error.message,
                    success: false
                });
            }
        }

        return results;
    }
}

module.exports = new AIImageAnalyzer();



