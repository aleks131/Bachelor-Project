class SearchSystem {
    constructor() {
        this.searchIndex = new Map();
        this.searchCache = new Map();
        this.lastSearchTime = 0;
        this.debounceDelay = 300;
    }

    /**
     * Initialize search system
     */
    async initialize() {
        await this.indexFiles();
        this.setupSearchListeners();
    }

    /**
     * Index files for search
     */
    async indexFiles() {
        try {
            const response = await fetch('/api/search/index');
            const data = await response.json();
            
            if (data.index) {
                this.searchIndex = new Map(Object.entries(data.index));
                console.log('Search index loaded:', this.searchIndex.size, 'items');
            }
        } catch (error) {
            console.error('Error indexing files:', error);
        }
    }

    /**
     * Search across all apps
     */
    async search(query, options = {}) {
        const {
            apps = ['all'],
            fileTypes = ['all'],
            limit = 50
        } = options;

        if (!query || query.length < 2) {
            return { results: [], total: 0 };
        }

        const cacheKey = `${query}_${apps.join(',')}_${fileTypes.join(',')}`;
        if (this.searchCache.has(cacheKey)) {
            return this.searchCache.get(cacheKey);
        }

        try {
            const response = await fetch('/api/search/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    apps,
                    fileTypes,
                    limit
                })
            });

            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            this.searchCache.set(cacheKey, data);
            
            // Clear cache after 5 minutes
            setTimeout(() => this.searchCache.delete(cacheKey), 5 * 60 * 1000);

            return data;
        } catch (error) {
            console.error('Error searching:', error);
            return { results: [], total: 0, error: error.message };
        }
    }

    /**
     * Setup search UI listeners
     */
    setupSearchListeners() {
        const searchInput = document.getElementById('global-search');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            searchTimeout = setTimeout(async () => {
                if (query.length >= 2) {
                    await this.performSearch(query);
                } else {
                    this.hideSearchResults();
                }
            }, this.debounceDelay);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(e.target.value.trim());
            } else if (e.key === 'Escape') {
                this.hideSearchResults();
            }
        });
    }

    /**
     * Perform search and display results
     */
    async performSearch(query) {
        const results = await this.search(query);
        this.displaySearchResults(results);
    }

    /**
     * Display search results
     */
    displaySearchResults(results) {
        let resultsContainer = document.getElementById('search-results');
        
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'search-results';
            resultsContainer.className = 'search-results';
            document.body.appendChild(resultsContainer);
        }

        if (results.results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${results.query || ''}"</p>
                </div>
            `;
            resultsContainer.style.display = 'block';
            return;
        }

        resultsContainer.innerHTML = `
            <div class="search-results-header">
                <span>${results.total} results found</span>
                <button onclick="searchSystem.hideSearchResults()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="search-results-list">
                ${results.results.map(item => `
                    <div class="search-result-item" onclick="searchSystem.openResult('${item.path}')">
                        <div class="result-icon">
                            <i class="fas fa-${item.type === 'image' ? 'image' : item.type === 'folder' ? 'folder' : 'file'}"></i>
                        </div>
                        <div class="result-content">
                            <div class="result-name">${this.highlightMatch(item.name, item.query)}</div>
                            <div class="result-path">${item.path}</div>
                            ${item.metadata ? `<div class="result-meta">${item.metadata}</div>` : ''}
                        </div>
                        <div class="result-action">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        resultsContainer.style.display = 'block';
    }

    /**
     * Highlight search match in text
     */
    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Hide search results
     */
    hideSearchResults() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    }

    /**
     * Open search result
     */
    openResult(resultPath) {
        // Navigate to appropriate app based on result type
        console.log('Opening result:', resultPath);
        this.hideSearchResults();
        
        // Implementation depends on result type
        // Could navigate to gallery, dashboard, or file browser
    }
}

const searchSystem = new SearchSystem();
window.searchSystem = searchSystem;
