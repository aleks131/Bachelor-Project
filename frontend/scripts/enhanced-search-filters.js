class EnhancedSearch {
    constructor() {
        this.filters = {
            fileType: null,
            dateRange: null,
            sizeRange: null,
            path: null
        };
        this.sortBy = 'relevance';
        this.sortOrder = 'desc';
        this.init();
    }
    
    init() {
        this.setupFilterUI();
        this.setupSortUI();
    }
    
    setupFilterUI() {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer) return;
        
        const filterButton = document.createElement('button');
        filterButton.className = 'filter-button';
        filterButton.innerHTML = '<i class="fas fa-filter"></i> Filters';
        filterButton.addEventListener('click', () => this.showFilterModal());
        
        searchContainer.appendChild(filterButton);
    }
    
    setupSortUI() {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer) return;
        
        const sortSelect = document.createElement('select');
        sortSelect.className = 'sort-select';
        sortSelect.innerHTML = `
            <option value="relevance">Relevance</option>
            <option value="date">Date</option>
            <option value="size">Size</option>
            <option value="name">Name</option>
        `;
        sortSelect.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.performSearch();
        });
        
        searchContainer.appendChild(sortSelect);
    }
    
    showFilterModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Search Filters</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="filter-group">
                        <label>File Type</label>
                        <select id="filterFileType">
                            <option value="">All Types</option>
                            <option value="image">Images</option>
                            <option value="video">Videos</option>
                            <option value="document">Documents</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Date Range</label>
                        <input type="date" id="filterDateFrom" placeholder="From">
                        <input type="date" id="filterDateTo" placeholder="To">
                    </div>
                    <div class="filter-group">
                        <label>Size Range</label>
                        <input type="number" id="filterSizeMin" placeholder="Min (MB)">
                        <input type="number" id="filterSizeMax" placeholder="Max (MB)">
                    </div>
                    <div class="filter-actions">
                        <button class="premium-button" onclick="window.enhancedSearch.applyFilters()">
                            Apply Filters
                        </button>
                        <button class="premium-button" onclick="window.enhancedSearch.clearFilters()">
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    applyFilters() {
        this.filters.fileType = document.getElementById('filterFileType')?.value || null;
        this.filters.dateRange = {
            from: document.getElementById('filterDateFrom')?.value || null,
            to: document.getElementById('filterDateTo')?.value || null
        };
        this.filters.sizeRange = {
            min: document.getElementById('filterSizeMin')?.value || null,
            max: document.getElementById('filterSizeMax')?.value || null
        };
        
        this.performSearch();
        document.querySelector('.modal.active')?.remove();
    }
    
    clearFilters() {
        this.filters = {
            fileType: null,
            dateRange: null,
            sizeRange: null,
            path: null
        };
        this.performSearch();
        document.querySelector('.modal.active')?.remove();
    }
    
    async performSearch(query = null) {
        const searchQuery = query || document.getElementById('globalSearchInput')?.value;
        if (!searchQuery) return;
        
        try {
            const response = await fetch('/api/search/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    query: searchQuery,
                    filters: this.filters,
                    sortBy: this.sortBy,
                    sortOrder: this.sortOrder
                })
            });
            
            const data = await response.json();
            this.displayResults(data.results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }
    
    displayResults(results) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No results found</p>';
            return;
        }
        
        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="result-icon">
                    <i class="fas fa-${this.getFileIcon(result.type)}"></i>
                </div>
                <div class="result-info">
                    <h4>${result.name}</h4>
                    <p>${result.path}</p>
                    <span class="result-meta">${this.formatSize(result.size)} • ${this.formatDate(result.modified)}</span>
                </div>
            `;
            item.addEventListener('click', () => this.openResult(result));
            resultsContainer.appendChild(item);
        });
    }
    
    getFileIcon(type) {
        const icons = {
            image: 'image',
            video: 'video',
            document: 'file-alt',
            folder: 'folder',
            other: 'file'
        };
        return icons[type] || 'file';
    }
    
    formatSize(bytes) {
        if (!bytes) return 'Unknown';
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${Math.round(bytes / 1024)} KB` : `${mb.toFixed(2)} MB`;
    }
    
    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }
    
    openResult(result) {
        if (result.type === 'folder') {
            window.location.href = `/app/gallery?folder=${encodeURIComponent(result.path)}`;
        } else {
            window.open(`/api/files/preview?path=${encodeURIComponent(result.path)}`, '_blank');
        }
    }
}

window.enhancedSearch = new EnhancedSearch();


