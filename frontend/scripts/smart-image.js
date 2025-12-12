class SmartImage {
    constructor() {
        this.imageCache = new Map();
        this.observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
        this.intersectionObserver = null;
    }

    /**
     * Initialize lazy loading observer
     */
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.intersectionObserver.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);
        }
    }

    /**
     * Load image with smart optimization
     */
    async loadImage(imgElement, imagePath, options = {}) {
        const {
            containerWidth,
            containerHeight,
            useThumbnail = true,
            quality = 'auto'
        } = options;

        if (!imagePath) {
            imagePath = imgElement.dataset.src || imgElement.src;
        }

        // Show loading state
        imgElement.classList.add('loading');
        imgElement.style.opacity = '0';

        try {
            // Get best fit recommendations
            let optimizedPath = imagePath;
            
            if (containerWidth && containerHeight) {
                const bestFit = await this.getBestFit(imagePath, containerWidth, containerHeight);
                
                if (bestFit.recommendations.useThumbnail && useThumbnail) {
                    optimizedPath = await this.getThumbnail(imagePath, containerWidth, containerHeight);
                } else if (bestFit.recommendations.optimizeForWeb) {
                    optimizedPath = await this.getOptimized(imagePath, containerWidth, containerHeight);
                }

                // Apply best fit styles
                this.applyBestFit(imgElement, bestFit.bestFit, bestFit.metadata);
            }

            // Load image
            await this.setImageSource(imgElement, optimizedPath || imagePath);
            
            imgElement.classList.remove('loading');
            imgElement.classList.add('loaded');
            imgElement.style.opacity = '1';
            imgElement.style.transition = 'opacity 0.3s ease-in';

        } catch (error) {
            console.error('Error loading image:', error);
            imgElement.classList.add('error');
            imgElement.classList.remove('loading');
        }
    }

    /**
     * Get best fit recommendations
     */
    async getBestFit(imagePath, containerWidth, containerHeight) {
        const cacheKey = `bestfit_${imagePath}_${containerWidth}_${containerHeight}`;
        
        if (this.imageCache.has(cacheKey)) {
            return this.imageCache.get(cacheKey);
        }

        try {
            const response = await fetch('/api/image/best-fit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imagePath,
                    containerWidth,
                    containerHeight
                })
            });

            if (!response.ok) throw new Error('Failed to get best fit');

            const data = await response.json();
            this.imageCache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error getting best fit:', error);
            return null;
        }
    }

    /**
     * Get thumbnail URL
     */
    async getThumbnail(imagePath, width = 300, height = 300) {
        try {
            const response = await fetch(
                `/api/image/thumbnail?imagePath=${encodeURIComponent(imagePath)}&width=${width}&height=${height}`
            );

            if (!response.ok) throw new Error('Failed to get thumbnail');

            const data = await response.json();
            return data.thumbnailPath;
        } catch (error) {
            console.error('Error getting thumbnail:', error);
            return imagePath; // Fallback to original
        }
    }

    /**
     * Get optimized image URL
     */
    async getOptimized(imagePath, maxWidth = 1920, maxHeight = 1080) {
        try {
            const response = await fetch(
                `/api/image/optimized?imagePath=${encodeURIComponent(imagePath)}&width=${maxWidth}&height=${maxHeight}`
            );

            if (!response.ok) throw new Error('Failed to get optimized image');

            const data = await response.json();
            return data.optimizedPath;
        } catch (error) {
            console.error('Error getting optimized image:', error);
            return imagePath; // Fallback to original
        }
    }

    /**
     * Apply best fit styles to image element
     */
    applyBestFit(imgElement, bestFit, metadata) {
        if (!bestFit || !metadata) return;

        imgElement.style.width = `${bestFit.width}px`;
        imgElement.style.height = `${bestFit.height}px`;
        imgElement.style.objectFit = bestFit.displayMode;
        
        // Add data attributes for reference
        imgElement.dataset.originalWidth = metadata.width;
        imgElement.dataset.originalHeight = metadata.height;
        imgElement.dataset.aspectRatio = metadata.aspectRatio.toFixed(2);
        imgElement.dataset.displayMode = bestFit.displayMode;
    }

    /**
     * Set image source with error handling
     */
    setImageSource(imgElement, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                imgElement.src = src;
                imgElement.onerror = null;
                resolve();
            };

            img.onerror = () => {
                imgElement.src = src; // Still set source for fallback
                reject(new Error('Failed to load image'));
            };

            img.src = src;
        });
    }

    /**
     * Make image lazy-loadable
     */
    makeLazy(imgElement, imagePath, options = {}) {
        if (!this.intersectionObserver) {
            this.initLazyLoading();
        }

        imgElement.dataset.src = imagePath;
        imgElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E'; // Placeholder
        
        const container = imgElement.closest('[data-container-width], .image-container, .widget-instance');
        if (container) {
            const containerWidth = container.offsetWidth || container.dataset.containerWidth || 400;
            const containerHeight = container.offsetHeight || container.dataset.containerHeight || 300;
            options.containerWidth = containerWidth;
            options.containerHeight = containerHeight;
        }

        this.intersectionObserver.observe(imgElement);
        imgElement.addEventListener('load', () => {
            this.loadImage(imgElement, imagePath, options);
        });
    }

    /**
     * Get image metadata
     */
    async getMetadata(imagePath) {
        try {
            const response = await fetch(
                `/api/image/metadata?imagePath=${encodeURIComponent(imagePath)}`
            );

            if (!response.ok) throw new Error('Failed to get metadata');

            const data = await response.json();
            return data.metadata;
        } catch (error) {
            console.error('Error getting metadata:', error);
            return null;
        }
    }

    /**
     * Format image info for display
     */
    formatImageInfo(metadata) {
        if (!metadata) return '';

        return `${metadata.width} × ${metadata.height}px • ${metadata.format.toUpperCase()} • ${metadata.fileSize}`;
    }

    /**
     * Preload images
     */
    preloadImages(imagePaths) {
        imagePaths.forEach(path => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = path;
            document.head.appendChild(link);
        });
    }
}

// Global instance
const smartImage = new SmartImage();
window.smartImage = smartImage;
