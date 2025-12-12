class EnhancedSearch {
    constructor() {
        this.filters = {
            fileTypes: [],
            dateRange: null,
            sizeRange: null,
            apps: []
        };
        this.searchHistory = [];
        this.maxHistory = 10;
        this.init();
    }

    init() {
        this.loadSearchHistory();
        this.setupFiltersUI();
    }

    setupFiltersUI() {
        // This will be enhanced when search UI is updated
    }

    async search(query, options = {}) {
        if (!query || query.length < 2) {
            return { results: [], total: 0 };
        }

        // Save to history
        this.addToHistory(query);

        // Merge with filters
        const searchOptions = {
            ...options,
            fileTypes: this.filters.fileTypes.length > 0 ? this.filters.fileTypes : ['all'],
            apps: this.filters.apps.length > 0 ? this.filters.apps : ['all'],
            dateRange: this.filters.dateRange,
            sizeRange: this.filters.sizeRange
        };

        try {
            const response = await fetch('/api/search/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    ...searchOptions
                })
            });

            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            
            // Track search
            if (window.analytics) {
                analytics.trackSearch(query, data.total);
            }

            return data;
        } catch (error) {
            console.error('Error searching:', error);
            return { results: [], total: 0, error: error.message };
        }
    }

    setFilter(type, value) {
        this.filters[type] = value;
        this.saveFilters();
    }

    clearFilters() {
        this.filters = {
            fileTypes: [],
            dateRange: null,
            sizeRange: null,
            apps: []
        };
        this.saveFilters();
    }

    addToHistory(query) {
        // Remove if exists
        this.searchHistory = this.searchHistory.filter(q => q !== query);
        
        // Add to beginning
        this.searchHistory.unshift(query);
        
        // Limit history
        if (this.searchHistory.length > this.maxHistory) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistory);
        }
        
        this.saveSearchHistory();
    }

    getSearchHistory() {
        return this.searchHistory;
    }

    clearHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }

    saveFilters() {
        localStorage.setItem('search-filters', JSON.stringify(this.filters));
    }

    loadFilters() {
        const saved = localStorage.getItem('search-filters');
        if (saved) {
            try {
                this.filters = { ...this.filters, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Error loading filters:', e);
            }
        }
    }

    saveSearchHistory() {
        localStorage.setItem('search-history', JSON.stringify(this.searchHistory));
    }

    loadSearchHistory() {
        const saved = localStorage.getItem('search-history');
        if (saved) {
            try {
                this.searchHistory = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading search history:', e);
            }
        }
    }

    // Filter helpers
    filterByFileType(results, fileTypes) {
        if (!fileTypes || fileTypes.length === 0 || fileTypes.includes('all')) {
            return results;
        }
        
        return results.filter(result => {
            const ext = result.extension?.toLowerCase().replace('.', '');
            return fileTypes.includes(ext);
        });
    }

    filterByDateRange(results, dateRange) {
        if (!dateRange || !dateRange.from || !dateRange.to) {
            return results;
        }
        
        const from = new Date(dateRange.from);
        const to = new Date(dateRange.to);
        
        return results.filter(result => {
            if (!result.modified) return false;
            const modified = new Date(result.modified);
            return modified >= from && modified <= to;
        });
    }

    filterBySizeRange(results, sizeRange) {
        if (!sizeRange || !sizeRange.min || !sizeRange.max) {
            return results;
        }
        
        return results.filter(result => {
            if (!result.size) return false;
            return result.size >= sizeRange.min && result.size <= sizeRange.max;
        });
    }
}

const enhancedSearch = new EnhancedSearch();
window.enhancedSearch = enhancedSearch;
