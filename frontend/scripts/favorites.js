class Favorites {
    constructor() {
        this.favorites = [];
        this.loadFavorites();
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.renderFavoritesList();
        });
    }

    loadFavorites() {
        try {
            const saved = localStorage.getItem('favorites');
            if (saved) {
                this.favorites = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
            this.favorites = [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
            
            if (window.analytics) {
                analytics.track('favorites_updated', { count: this.favorites.length });
            }
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    addFavorite(item) {
        if (this.isFavorite(item.path || item.id)) {
            return false;
        }

        const favorite = {
            id: this.generateId(),
            path: item.path || item.id,
            name: item.name || this.getFileName(item.path || item.id),
            type: item.type || 'file',
            addedAt: new Date().toISOString(),
            metadata: item.metadata || {}
        };

        this.favorites.push(favorite);
        this.saveFavorites();
        this.updateFavoritesUI();

        if (window.toast) {
            toast.success('Added to favorites');
        }

        return true;
    }

    removeFavorite(pathOrId) {
        const index = this.favorites.findIndex(fav => fav.path === pathOrId || fav.id === pathOrId);
        
        if (index === -1) {
            return false;
        }

        this.favorites.splice(index, 1);
        this.saveFavorites();
        this.updateFavoritesUI();

        if (window.toast) {
            toast.success('Removed from favorites');
        }

        return true;
    }

    isFavorite(pathOrId) {
        return this.favorites.some(fav => fav.path === pathOrId || fav.id === pathOrId);
    }

    toggleFavorite(item) {
        const pathOrId = item.path || item.id;
        
        if (this.isFavorite(pathOrId)) {
            return this.removeFavorite(pathOrId);
        } else {
            return this.addFavorite(item);
        }
    }

    getAllFavorites() {
        return [...this.favorites];
    }

    getFavoritesByType(type) {
        return this.favorites.filter(fav => fav.type === type);
    }

    clearFavorites() {
        if (confirm('Clear all favorites?')) {
            this.favorites = [];
            this.saveFavorites();
            this.updateFavoritesUI();
            
            if (window.toast) {
                toast.success('Favorites cleared');
            }
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getFileName(path) {
        return path.split(/[/\\]/).pop();
    }

    updateFavoritesUI() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const pathOrId = btn.dataset.path || btn.dataset.id;
            if (pathOrId) {
                if (this.isFavorite(pathOrId)) {
                    btn.classList.add('is-favorite');
                    btn.innerHTML = '<i class="fas fa-star"></i>';
                } else {
                    btn.classList.remove('is-favorite');
                    btn.innerHTML = '<i class="far fa-star"></i>';
                }
            }
        });

        this.renderFavoritesList();
    }

    renderFavoritesList() {
        const container = document.getElementById('favorites-list');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div class="favorites-empty">
                    <i class="fas fa-star fa-3x"></i>
                    <p>No favorites yet</p>
                    <p class="favorites-hint">Click the star icon on any item to add it to favorites</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="favorites-header">
                <h4>Favorites (${this.favorites.length})</h4>
                <button class="btn btn-sm btn-secondary" onclick="favorites.clearFavorites()">
                    <i class="fas fa-trash"></i> Clear All
                </button>
            </div>
            <div class="favorites-grid">
                ${this.favorites.map(fav => `
                    <div class="favorite-item" data-id="${fav.id}">
                        <div class="favorite-item-content">
                            <div class="favorite-icon">
                                ${fav.type === 'folder' ? '<i class="fas fa-folder"></i>' : '<i class="fas fa-file"></i>'}
                            </div>
                            <div class="favorite-info">
                                <div class="favorite-name">${fav.name}</div>
                                <div class="favorite-meta">
                                    Added ${new Date(fav.addedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div class="favorite-actions">
                            <button class="favorite-action-btn" onclick="favorites.openFavorite('${fav.path}')" title="Open">
                                <i class="fas fa-folder-open"></i>
                            </button>
                            <button class="favorite-action-btn" onclick="favorites.removeFavorite('${fav.id}')" title="Remove">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    openFavorite(path) {
        if (window.filePreview) {
            filePreview.show(path);
        } else if (window.onFavoriteOpen) {
            window.onFavoriteOpen(path);
        }
    }
}

const favorites = new Favorites();
window.favorites = favorites;

document.addEventListener('click', (e) => {
    if (e.target.closest('.favorite-btn') || e.target.classList.contains('favorite-btn')) {
        const btn = e.target.closest('.favorite-btn') || e.target;
        const path = btn.dataset.path || btn.dataset.id;
        const name = btn.dataset.name || '';
        const type = btn.dataset.type || 'file';
        
        if (path) {
            favorites.toggleFavorite({ path, name, type });
        }
    }
});



