class AIUI {
    constructor() {
        this.currentImage = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            const analyzeColorsBtn = document.getElementById('analyze-colors-btn');
            const findDuplicatesBtn = document.getElementById('find-duplicates-btn');
            const analyzeContentBtn = document.getElementById('analyze-content-btn');
            const findSimilarBtn = document.getElementById('find-similar-btn');
            const extractTextBtn = document.getElementById('extract-text-btn');

            if (analyzeColorsBtn) {
                analyzeColorsBtn.addEventListener('click', () => this.handleAnalyzeColors());
            }

            if (findDuplicatesBtn) {
                findDuplicatesBtn.addEventListener('click', () => this.handleFindDuplicates());
            }

            if (analyzeContentBtn) {
                analyzeContentBtn.addEventListener('click', () => this.handleAnalyzeContent());
            }

            if (findSimilarBtn) {
                findSimilarBtn.addEventListener('click', () => this.handleFindSimilar());
            }

            if (extractTextBtn) {
                extractTextBtn.addEventListener('click', () => this.handleExtractText());
            }
        });
    }

    setCurrentImage(imagePath) {
        this.currentImage = imagePath;
        this.updateUI();
    }

    updateUI() {
        const container = document.getElementById('ai-results-container');
        if (!container) return;

        if (!this.currentImage) {
            container.innerHTML = `
                <div class="ai-results-placeholder">
                    <i class="fas fa-magic fa-3x"></i>
                    <p>Select an image and choose an AI feature to get started</p>
                </div>
            `;
        }
    }

    async handleAnalyzeColors() {
        if (!this.currentImage) {
            if (window.toast) toast.warning('Please select an image first');
            return;
        }

        try {
            if (window.loadingStates) {
                loadingStates.showLoading('ai-results-container', 'Analyzing colors...');
            }

            const palette = await aiFeatures.analyzeColors(this.currentImage);

            if (window.loadingStates) {
                loadingStates.hideLoading('ai-results-container');
            }

            this.renderColorAnalysis(palette);
        } catch (error) {
            console.error('Error analyzing colors:', error);
            if (window.loadingStates) {
                loadingStates.hideLoading('ai-results-container');
            }
        }
    }

    renderColorAnalysis(palette) {
        const container = document.getElementById('ai-results-container');
        if (!container || !palette) return;

        container.innerHTML = `
            <div class="ai-result-section">
                <h4>Color Palette</h4>
                <div class="color-palette">
                    ${palette.colors.map(color => `
                        <div class="color-swatch" style="background-color: ${color.hex}" 
                             title="${color.hex} - ${color.percentage.toFixed(1)}%">
                            <span class="color-hex">${color.hex}</span>
                            <span class="color-percentage">${color.percentage.toFixed(1)}%</span>
                        </div>
                    `).join('')}
                </div>
                <div class="color-info">
                    <p><strong>Dominant Color:</strong> <span style="color: ${palette.dominant.hex}">${palette.dominant.hex}</span> (${palette.primaryColor})</p>
                    <p><strong>Temperature:</strong> ${palette.colorTemperature}</p>
                    <p><strong>Brightness:</strong> ${palette.isDark ? 'Dark' : 'Light'}</p>
                </div>
            </div>
        `;
    }

    async handleFindDuplicates() {
        const imagePaths = this.getAllImagePaths();
        
        if (imagePaths.length < 2) {
            if (window.toast) toast.warning('Need at least 2 images to find duplicates');
            return;
        }

        try {
            if (window.loadingStates) {
                loadingStates.showLoading('ai-results-container', 'Finding duplicates...');
            }

            const result = await aiFeatures.findDuplicates(imagePaths);

            if (window.loadingStates) {
                loadingStates.hideLoading('ai-results-container');
            }

            this.renderDuplicates(result.duplicates);
        } catch (error) {
            console.error('Error finding duplicates:', error);
            if (window.loadingStates) {
                loadingStates.hideLoading('ai-results-container');
            }
        }
    }

    renderDuplicates(duplicates) {
        const container = document.getElementById('ai-results-container');
        if (!container) return;

        if (duplicates.length === 0) {
            container.innerHTML = `
                <div class="ai-result-section">
                    <p><i class="fas fa-check-circle"></i> No duplicates found!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="ai-result-section">
                <h4>Found ${duplicates.length} Duplicate Group(s)</h4>
                ${duplicates.map((group, index) => `
                    <div class="duplicate-group">
                        <div class="duplicate-group-header">
                            <span class="duplicate-group-title">Group ${index + 1}</span>
                            <span class="duplicate-group-count">${group.count} images</span>
                        </div>
                        <div class="duplicate-items">
                            ${group.group.map(imgPath => `
                                <div class="duplicate-item" onclick="filePreview.show('${imgPath.replace(/'/g, "\\'")}')">
                                    <img src="/api/files/preview?filePath=${encodeURIComponent(imgPath)}&download=true" alt="Duplicate">
                                    <div class="duplicate-item-name">${this.getFileName(imgPath)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async handleAnalyzeContent() {
        if (!this.currentImage) {
            if (window.toast) toast.warning('Please select an image first');
            return;
        }

        try {
            if (window.loadingStates) {
                loadingStates.showLoading('ai-results-container', 'Analyzing content...');
            }

            const analysis = await aiFeatures.analyzeContent(this.currentImage);

            if (window.loadingStates) {
                loadingStates.hideLoading('ai-results-container');
            }

            this.renderContentAnalysis(analysis);
        } catch (error) {
            console.error('Error analyzing content:', error);
            if (window.loadingStates) {
                loadingStates.hideLoading('ai-results-container');
            }
        }
    }

    renderContentAnalysis(analysis) {
        const container = document.getElementById('ai-results-container');
        if (!container || !analysis) return;

        container.innerHTML = `
            <div class="ai-result-section">
                <h4>Content Analysis</h4>
                <div class="content-analysis-grid">
                    <div class="analysis-card">
                        <h5>Tags</h5>
                        <div class="ai-tags">
                            ${analysis.tags.map(tag => `<span class="ai-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="analysis-card">
                        <h5>Features</h5>
                        <ul class="features-list">
                            <li>Photo: ${analysis.features.isPhoto ? 'Yes' : 'No'}</li>
                            <li>Vector: ${analysis.features.isVector ? 'Yes' : 'No'}</li>
                            <li>Complexity: ${analysis.features.complexity}</li>
                        </ul>
                    </div>
                    <div class="analysis-card">
                        <h5>Dimensions</h5>
                        <p>${analysis.metadata.width} x ${analysis.metadata.height}px</p>
                        <p>Format: ${analysis.metadata.format}</p>
                    </div>
                </div>
            </div>
        `;
    }

    async handleFindSimilar() {
        if (!this.currentImage) {
            if (window.toast) toast.warning('Please select an image first');
            return;
        }

        const candidateImages = this.getAllImagePaths().filter(p => p !== this.currentImage);
        
        if (candidateImages.length === 0) {
            if (window.toast) toast.warning('Need more images to find similar');
            return;
        }

        try {
            if (window.loadingStates) {
                loadingStates.showLoading('ai-results-container', 'Finding similar images...');
            }

            const result = await aiFeatures.findSimilar(this.currentImage, candidateImages);

            if (window.loadingStates) {
                loadingStates.hideLoading('ai-results-container');
            }

            this.renderSimilarImages(result.similar);
        } catch (error) {
            console.error('Error finding similar:', error);
            if (window.loadingStates) {
                loadingStates.hideLoading('ai-results-container');
            }
        }
    }

    renderSimilarImages(similar) {
        const container = document.getElementById('ai-results-container');
        if (!container) return;

        if (similar.length === 0) {
            container.innerHTML = `
                <div class="ai-result-section">
                    <p><i class="fas fa-info-circle"></i> No similar images found.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="ai-result-section">
                <h4>Found ${similar.length} Similar Image(s)</h4>
                <div class="similar-images-grid">
                    ${similar.map(item => `
                        <div class="similar-image-card" onclick="filePreview.show('${item.path.replace(/'/g, "\\'")}')">
                            <img src="/api/files/preview?filePath=${encodeURIComponent(item.path)}&download=true" alt="Similar">
                            <div class="similar-image-info">
                                <div class="similarity-score">${item.similarity}% similar</div>
                                <div class="similar-image-name">${this.getFileName(item.path)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getAllImagePaths() {
        // This should be implemented based on the current app context
        // For now, return empty array - each app will need to provide this
        if (window.getCurrentImagePaths) {
            return window.getCurrentImagePaths();
        }
        return [];
    }

    getFileName(filePath) {
        return filePath.split(/[/\\]/).pop();
    }
}

const aiUI = new AIUI();
window.aiUI = aiUI;



