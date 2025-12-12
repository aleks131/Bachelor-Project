class AIFeatures {
    constructor() {
        this.cache = new Map();
        this.init();
    }

    init() {
        // Initialize AI features
    }

    async analyzeColors(imagePath, numColors = 5) {
        try {
            const cacheKey = `colors_${imagePath}_${numColors}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const response = await fetch('/api/ai/analyze-color', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imagePath, numColors })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze colors');
            }

            const data = await response.json();
            this.cache.set(cacheKey, data.palette);
            
            if (window.analytics) {
                analytics.track('ai_feature', { feature: 'color_analysis', imagePath });
            }

            return data.palette;
        } catch (error) {
            console.error('Error analyzing colors:', error);
            if (window.toast) {
                toast.error('Failed to analyze colors');
            }
            return null;
        }
    }

    async findDuplicates(imagePaths, threshold = 95) {
        try {
            const response = await fetch('/api/ai/find-duplicates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imagePaths, threshold })
            });

            if (!response.ok) {
                throw new Error('Failed to find duplicates');
            }

            const data = await response.json();
            
            if (window.analytics) {
                analytics.track('ai_feature', { feature: 'duplicate_detection', count: data.count });
            }

            return data;
        } catch (error) {
            console.error('Error finding duplicates:', error);
            if (window.toast) {
                toast.error('Failed to find duplicates');
            }
            return { duplicates: [], count: 0 };
        }
    }

    async analyzeContent(imagePath) {
        try {
            const cacheKey = `content_${imagePath}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const response = await fetch('/api/ai/analyze-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imagePath })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze content');
            }

            const data = await response.json();
            this.cache.set(cacheKey, data.analysis);
            
            if (window.analytics) {
                analytics.track('ai_feature', { feature: 'content_analysis', imagePath });
            }

            return data.analysis;
        } catch (error) {
            console.error('Error analyzing content:', error);
            if (window.toast) {
                toast.error('Failed to analyze content');
            }
            return null;
        }
    }

    async findSimilar(targetImage, candidateImages, threshold = 85) {
        try {
            const response = await fetch('/api/ai/find-similar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetImage, candidateImages, threshold })
            });

            if (!response.ok) {
                throw new Error('Failed to find similar images');
            }

            const data = await response.json();
            
            if (window.analytics) {
                analytics.track('ai_feature', { feature: 'similarity_search', count: data.count });
            }

            return data;
        } catch (error) {
            console.error('Error finding similar images:', error);
            if (window.toast) {
                toast.error('Failed to find similar images');
            }
            return { similar: [], count: 0 };
        }
    }

    async batchAnalyze(imagePaths) {
        try {
            if (window.loadingStates) {
                loadingStates.showLoading('ai-analysis-container', 'Analyzing images...');
            }

            const response = await fetch('/api/ai/batch-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imagePaths })
            });

            if (!response.ok) {
                throw new Error('Failed to batch analyze');
            }

            const data = await response.json();
            
            if (window.loadingStates) {
                loadingStates.hideLoading('ai-analysis-container');
            }

            if (window.toast) {
                toast.success(`Analyzed ${data.successful} of ${data.total} images`);
            }

            if (window.analytics) {
                analytics.track('ai_feature', { feature: 'batch_analysis', total: data.total, successful: data.successful });
            }

            return data;
        } catch (error) {
            console.error('Error batch analyzing:', error);
            if (window.loadingStates) {
                loadingStates.hideLoading('ai-analysis-container');
            }
            if (window.toast) {
                toast.error('Failed to batch analyze');
            }
            return { results: [], total: 0, successful: 0 };
        }
    }

    async getCharacteristics(imagePath) {
        try {
            const cacheKey = `characteristics_${imagePath}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const response = await fetch(`/api/ai/characteristics?imagePath=${encodeURIComponent(imagePath)}`);

            if (!response.ok) {
                throw new Error('Failed to get characteristics');
            }

            const data = await response.json();
            this.cache.set(cacheKey, data.characteristics);
            
            return data.characteristics;
        } catch (error) {
            console.error('Error getting characteristics:', error);
            return null;
        }
    }

    async extractText(imagePath, options = {}) {
        try {
            const cacheKey = `ocr_${imagePath}`;
            if (this.cache.has(cacheKey) && !options.force) {
                return this.cache.get(cacheKey);
            }

            if (window.toast) {
                window.toast.info('Extracting text from image... This may take a moment.');
            }

            const response = await fetch('/api/ai/extract-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    imagePath, 
                    language: options.language || 'eng',
                    force: options.force || false
                })
            });

            if (!response.ok) {
                throw new Error('Failed to extract text');
            }

            const data = await response.json();
            
            if (!data.ocr) {
                throw new Error('Invalid OCR response');
            }

            this.cache.set(cacheKey, data.ocr);
            
            if (window.analytics) {
                analytics.track('ai_feature', { feature: 'ocr_extraction', imagePath });
            }
            
            if (window.toast && data.ocr.wordCount > 0) {
                window.toast.success(`Extracted ${data.ocr.wordCount} words with ${data.ocr.confidence}% confidence`);
            } else if (window.toast && data.ocr.wordCount === 0) {
                window.toast.warning('No text found in image');
            }

            return data.ocr;
        } catch (error) {
            console.error('Error extracting text:', error);
            if (window.toast) {
                window.toast.error('Failed to extract text from image: ' + error.message);
            }
            return null;
        }
    }

    async batchExtractText(imagePaths, options = {}) {
        try {
            if (window.toast) {
                window.toast.info(`Processing ${imagePaths.length} images for OCR...`);
            }

            const response = await fetch('/api/ai/batch-extract-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    imagePaths, 
                    language: options.language || 'eng'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to batch extract text');
            }

            const data = await response.json();
            
            if (window.analytics) {
                analytics.track('ai_feature', { 
                    feature: 'batch_ocr_extraction', 
                    count: imagePaths.length 
                });
            }
            
            if (window.toast) {
                window.toast.success(`Processed ${data.successful} of ${data.total} images`);
            }

            return data;
        } catch (error) {
            console.error('Error batch extracting text:', error);
            if (window.toast) {
                window.toast.error('Failed to batch extract text');
            }
            return null;
        }
    }

    renderColorPalette(colors, containerId) {
        const container = document.getElementById(containerId) || document.querySelector(containerId);
        if (!container || !colors) return;

        container.innerHTML = colors.map(color => `
            <div class="color-swatch" style="background-color: ${color.hex}" title="${color.hex} - ${color.percentage.toFixed(1)}%">
                <span class="color-hex">${color.hex}</span>
                <span class="color-percentage">${color.percentage.toFixed(1)}%</span>
            </div>
        `).join('');
    }

    renderOCRResult(ocrResult, containerId) {
        const container = document.getElementById(containerId) || document.querySelector(containerId);
        if (!container || !ocrResult) return;

        if (!ocrResult.text || ocrResult.text.trim() === '') {
            container.innerHTML = '<div class="ocr-no-text">No text found in image</div>';
            return;
        }

        container.innerHTML = `
            <div class="ocr-result">
                <div class="ocr-header">
                    <h4>Extracted Text</h4>
                    <div class="ocr-stats">
                        <span>Confidence: ${ocrResult.confidence}%</span>
                        <span>Words: ${ocrResult.wordCount}</span>
                        <span>Lines: ${ocrResult.lineCount}</span>
                    </div>
                </div>
                <div class="ocr-text-content">
                    <pre>${ocrResult.text}</pre>
                </div>
                ${ocrResult.paragraphs && ocrResult.paragraphs.length > 0 ? `
                    <div class="ocr-paragraphs">
                        <h5>Paragraphs:</h5>
                        ${ocrResult.paragraphs.map((p, i) => `
                            <div class="ocr-paragraph">
                                <strong>Paragraph ${i + 1} (${Math.round(p.confidence)}%):</strong>
                                <p>${p.text}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    clearCache() {
        this.cache.clear();
    }
}

const aiFeatures = new AIFeatures();
window.aiFeatures = aiFeatures;



