const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class ImageProcessor {
    constructor() {
        this.cacheDir = path.join(__dirname, '../../data/image-cache');
        this.thumbnailsDir = path.join(__dirname, '../../data/thumbnails');
        this.ensureCacheDirs();
    }

    ensureCacheDirs() {
        [this.cacheDir, this.thumbnailsDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Get image metadata and dimensions
     */
    async getImageMetadata(imagePath) {
        try {
            if (!fs.existsSync(imagePath)) {
                return null;
            }

            const stats = fs.statSync(imagePath);
            const metadata = await sharp(imagePath).metadata();
            
            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: stats.size,
                hasAlpha: metadata.hasAlpha || false,
                channels: metadata.channels || 3,
                density: metadata.density || 72,
                orientation: metadata.orientation || 1,
                exif: metadata.exif ? this.parseExif(metadata.exif) : null,
                fileSize: this.formatFileSize(stats.size),
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
                aspectRatio: metadata.width / metadata.height,
                isPortrait: metadata.height > metadata.width,
                isLandscape: metadata.width > metadata.height,
                isSquare: Math.abs(metadata.width - metadata.height) < 10
            };
        } catch (error) {
            console.error('Error getting image metadata:', error);
            return null;
        }
    }

    /**
     * Determine best display format for container
     */
    calculateBestFit(imageMetadata, containerWidth, containerHeight) {
        if (!imageMetadata) return null;

        const { width, height, aspectRatio } = imageMetadata;
        const containerAspect = containerWidth / containerHeight;

        let displayMode = 'contain'; // contain, cover, fill
        let displayWidth = containerWidth;
        let displayHeight = containerHeight;
        let scale = 1;

        // Calculate scale to fit
        const scaleWidth = containerWidth / width;
        const scaleHeight = containerHeight / height;

        if (aspectRatio > containerAspect) {
            // Image is wider than container
            scale = scaleWidth;
            displayHeight = height * scale;
        } else {
            // Image is taller than container
            scale = scaleHeight;
            displayWidth = width * scale;
        }

        // Determine display mode
        if (scaleWidth > 1 && scaleHeight > 1) {
            displayMode = 'contain'; // Image smaller than container
        } else if (Math.abs(aspectRatio - containerAspect) < 0.1) {
            displayMode = 'fill'; // Very similar aspect ratios
        } else {
            displayMode = 'contain'; // Default to contain
        }

        return {
            displayMode,
            width: Math.round(displayWidth),
            height: Math.round(displayHeight),
            scale,
            fitsContainer: scaleWidth <= 1 && scaleHeight <= 1,
            recommendedMode: this.getRecommendedMode(imageMetadata, containerWidth, containerHeight)
        };
    }

    getRecommendedMode(imageMetadata, containerWidth, containerHeight) {
        const { width, height, aspectRatio } = imageMetadata;
        const containerAspect = containerWidth / containerHeight;
        const aspectDiff = Math.abs(aspectRatio - containerAspect);

        if (aspectDiff < 0.1) {
            return 'fill'; // Fill container exactly
        } else if (width < containerWidth && height < containerHeight) {
            return 'original'; // Show original size
        } else if (aspectRatio > containerAspect) {
            return 'fit-width'; // Fit to width
        } else {
            return 'fit-height'; // Fit to height
        }
    }

    /**
     * Generate thumbnail with smart sizing
     */
    async generateThumbnail(imagePath, options = {}) {
        try {
            const {
                width = 300,
                height = 300,
                quality = 80,
                fit = 'cover'
            } = options;

            const imageHash = this.getImageHash(imagePath);
            const thumbnailPath = path.join(this.thumbnailsDir, `${imageHash}_${width}x${height}.jpg`);

            // Return cached thumbnail if exists
            if (fs.existsSync(thumbnailPath)) {
                return thumbnailPath;
            }

            // Generate thumbnail
            await sharp(imagePath)
                .resize(width, height, {
                    fit: fit,
                    position: 'center',
                    withoutEnlargement: true
                })
                .jpeg({ quality })
                .toFile(thumbnailPath);

            return thumbnailPath;
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            return null;
        }
    }

    /**
     * Optimize image for web display
     */
    async optimizeImage(imagePath, options = {}) {
        try {
            const {
                maxWidth = 1920,
                maxHeight = 1080,
                quality = 85,
                format = 'jpeg'
            } = options;

            const imageHash = this.getImageHash(imagePath);
            const optimizedPath = path.join(this.cacheDir, `${imageHash}_${maxWidth}x${maxHeight}.${format}`);

            if (fs.existsSync(optimizedPath)) {
                return optimizedPath;
            }

            const image = sharp(imagePath);
            const metadata = await image.metadata();

            let width = metadata.width;
            let height = metadata.height;

            // Calculate resize dimensions
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            // Optimize based on format
            if (format === 'jpeg' || format === 'jpg') {
                await image
                    .resize(width, height, { withoutEnlargement: true })
                    .jpeg({ quality, progressive: true, mozjpeg: true })
                    .toFile(optimizedPath);
            } else if (format === 'webp') {
                await image
                    .resize(width, height, { withoutEnlargement: true })
                    .webp({ quality })
                    .toFile(optimizedPath);
            } else if (format === 'png') {
                await image
                    .resize(width, height, { withoutEnlargement: true })
                    .png({ quality, compressionLevel: 9 })
                    .toFile(optimizedPath);
            }

            return optimizedPath;
        } catch (error) {
            console.error('Error optimizing image:', error);
            return imagePath; // Return original on error
        }
    }

    /**
     * Get image hash for caching
     */
    getImageHash(imagePath) {
        const crypto = require('crypto');
        const stats = fs.statSync(imagePath);
        const hash = crypto.createHash('md5')
            .update(imagePath + stats.mtime.getTime())
            .digest('hex');
        return hash;
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Parse EXIF data
     */
    parseExif(exifBuffer) {
        try {
            // Basic EXIF parsing (can be enhanced)
            return {
                hasExif: true,
                // Add more EXIF parsing as needed
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Detect image orientation and suggest rotation
     */
    async detectOrientation(imagePath) {
        try {
            const metadata = await sharp(imagePath).metadata();
            return {
                orientation: metadata.orientation || 1,
                needsRotation: metadata.orientation && metadata.orientation > 1,
                suggestedRotation: this.getRotationAngle(metadata.orientation)
            };
        } catch (error) {
            return { orientation: 1, needsRotation: false };
        }
    }

    getRotationAngle(orientation) {
        const rotations = {
            1: 0,
            3: 180,
            6: 90,
            8: -90
        };
        return rotations[orientation] || 0;
    }

    /**
     * Batch process multiple images
     */
    async batchProcess(images, processor) {
        const results = [];
        for (const image of images) {
            try {
                const result = await processor(image);
                results.push({ image, result, success: true });
            } catch (error) {
                results.push({ image, error: error.message, success: false });
            }
        }
        return results;
    }
}

module.exports = new ImageProcessor();
