class BulkOperations {
    constructor() {
        this.selectedItems = new Set();
        this.selectMode = false;
        this.callbacks = {
            onSelect: null,
            onDeselect: null,
            onBulkAction: null
        };
        this.init();
    }

    init() {
        this.setupKeyboardShortcuts();
        this.setupSelectModeToggle();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + A to select all
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && this.selectMode) {
                e.preventDefault();
                this.selectAll();
            }
            
            // Escape to exit select mode
            if (e.key === 'Escape' && this.selectMode) {
                e.preventDefault();
                this.exitSelectMode();
            }
            
            // Delete key to delete selected
            if (e.key === 'Delete' && this.selectMode && this.selectedItems.size > 0) {
                e.preventDefault();
                this.confirmBulkDelete();
            }
        });
    }

    setupSelectModeToggle() {
        // Create select mode button (will be added to UI)
        this.createSelectModeButton();
    }

    createSelectModeButton() {
        // This will be called when needed in specific apps
    }

    enableSelectMode(container, itemSelector, getItemId) {
        this.selectMode = true;
        this.container = container;
        this.itemSelector = itemSelector;
        this.getItemId = getItemId || ((item) => item.dataset.id || item.id);
        
        // Add select mode indicator
        this.showSelectModeIndicator();
        
        // Make items selectable
        this.makeItemsSelectable(container, itemSelector);
        
        // Show bulk action toolbar
        this.showBulkToolbar();
        
        // Track
        if (window.analytics) {
            analytics.track('select_mode_enabled');
        }
    }

    exitSelectMode() {
        this.selectMode = false;
        this.selectedItems.clear();
        
        // Remove select indicators
        if (this.container) {
            this.container.querySelectorAll('.item-selected').forEach(item => {
                item.classList.remove('item-selected');
            });
        }
        
        // Hide toolbar
        this.hideBulkToolbar();
        this.hideSelectModeIndicator();
        
        // Track
        if (window.analytics) {
            analytics.track('select_mode_disabled');
        }
    }

    makeItemsSelectable(container, selector) {
        const items = container.querySelectorAll(selector);
        
        items.forEach(item => {
            // Add checkbox if not exists
            if (!item.querySelector('.bulk-select-checkbox')) {
                const checkbox = document.createElement('div');
                checkbox.className = 'bulk-select-checkbox';
                checkbox.innerHTML = '<i class="fas fa-check"></i>';
                item.insertBefore(checkbox, item.firstChild);
            }
            
            // Make clickable
            item.classList.add('selectable-item');
            item.style.cursor = 'pointer';
            
            item.addEventListener('click', (e) => {
                if (e.target.closest('.bulk-action-btn')) return;
                this.toggleItem(item);
            });
        });
    }

    toggleItem(item) {
        const itemId = this.getItemId(item);
        
        if (this.selectedItems.has(itemId)) {
            this.deselectItem(item, itemId);
        } else {
            this.selectItem(item, itemId);
        }
        
        this.updateBulkToolbar();
    }

    selectItem(item, itemId) {
        this.selectedItems.add(itemId);
        item.classList.add('item-selected');
        
        if (this.callbacks.onSelect) {
            this.callbacks.onSelect(item, itemId);
        }
    }

    deselectItem(item, itemId) {
        this.selectedItems.delete(itemId);
        item.classList.remove('item-selected');
        
        if (this.callbacks.onDeselect) {
            this.callbacks.onDeselect(item, itemId);
        }
    }

    selectAll() {
        if (!this.container) return;
        
        const items = this.container.querySelectorAll(this.itemSelector);
        items.forEach(item => {
            const itemId = this.getItemId(item);
            if (!this.selectedItems.has(itemId)) {
                this.selectItem(item, itemId);
            }
        });
        
        this.updateBulkToolbar();
    }

    deselectAll() {
        this.selectedItems.forEach(itemId => {
            const item = this.container.querySelector(`[data-id="${itemId}"]`);
            if (item) {
                this.deselectItem(item, itemId);
            }
        });
        this.updateBulkToolbar();
    }

    showBulkToolbar() {
        let toolbar = document.getElementById('bulk-action-toolbar');
        
        if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.id = 'bulk-action-toolbar';
            toolbar.className = 'bulk-action-toolbar';
            toolbar.innerHTML = `
                <div class="bulk-toolbar-content">
                    <div class="bulk-toolbar-info">
                        <span id="bulk-selection-count">0</span> item(s) selected
                    </div>
                    <div class="bulk-toolbar-actions">
                        <button class="bulk-action-btn" id="bulk-select-all" title="Select All (Ctrl+A)">
                            <i class="fas fa-check-square"></i> Select All
                        </button>
                        <button class="bulk-action-btn" id="bulk-deselect-all" title="Deselect All">
                            <i class="fas fa-square"></i> Deselect All
                        </button>
                        <button class="bulk-action-btn" id="bulk-download" title="Download Selected">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="bulk-action-btn" id="bulk-copy" title="Copy Selected">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <button class="bulk-action-btn bulk-danger" id="bulk-delete" title="Delete Selected (Delete)">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button class="bulk-action-btn" id="bulk-cancel" title="Cancel (Esc)">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(toolbar);
            
            // Setup button handlers
            document.getElementById('bulk-select-all').addEventListener('click', () => this.selectAll());
            document.getElementById('bulk-deselect-all').addEventListener('click', () => this.deselectAll());
            document.getElementById('bulk-download').addEventListener('click', () => this.bulkDownload());
            document.getElementById('bulk-copy').addEventListener('click', () => this.bulkCopy());
            document.getElementById('bulk-delete').addEventListener('click', () => this.confirmBulkDelete());
            document.getElementById('bulk-cancel').addEventListener('click', () => this.exitSelectMode());
        }
        
        toolbar.style.display = 'flex';
        this.updateBulkToolbar();
    }

    hideBulkToolbar() {
        const toolbar = document.getElementById('bulk-action-toolbar');
        if (toolbar) {
            toolbar.style.display = 'none';
        }
    }

    updateBulkToolbar() {
        const countEl = document.getElementById('bulk-selection-count');
        if (countEl) {
            countEl.textContent = this.selectedItems.size;
        }
        
        // Enable/disable action buttons based on selection
        const actionBtns = document.querySelectorAll('#bulk-action-toolbar .bulk-action-btn:not(#bulk-cancel)');
        actionBtns.forEach(btn => {
            btn.disabled = this.selectedItems.size === 0;
        });
    }

    showSelectModeIndicator() {
        let indicator = document.getElementById('select-mode-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'select-mode-indicator';
            indicator.className = 'select-mode-indicator';
            indicator.innerHTML = `
                <i class="fas fa-check-square"></i>
                <span>Select Mode Active</span>
                <button onclick="bulkOperations.exitSelectMode()" class="btn-exit-select">
                    <i class="fas fa-times"></i> Exit
                </button>
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.style.display = 'flex';
    }

    hideSelectModeIndicator() {
        const indicator = document.getElementById('select-mode-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    getSelectedItems() {
        return Array.from(this.selectedItems);
    }

    bulkDownload() {
        if (this.selectedItems.size === 0) return;
        
        // Trigger callback or default action
        if (this.callbacks.onBulkAction) {
            this.callbacks.onBulkAction('download', Array.from(this.selectedItems));
        }
        
        // Track
        if (window.analytics) {
            analytics.track('bulk_action', { action: 'download', count: this.selectedItems.size });
        }
    }

    bulkCopy() {
        if (this.selectedItems.size === 0) return;
        
        if (this.callbacks.onBulkAction) {
            this.callbacks.onBulkAction('copy', Array.from(this.selectedItems));
        }
        
        if (window.analytics) {
            analytics.track('bulk_action', { action: 'copy', count: this.selectedItems.size });
        }
    }

    confirmBulkDelete() {
        if (this.selectedItems.size === 0) return;
        
        const count = this.selectedItems.size;
        if (confirm(`Are you sure you want to delete ${count} item(s)? This action cannot be undone.`)) {
            if (this.callbacks.onBulkAction) {
                this.callbacks.onBulkAction('delete', Array.from(this.selectedItems));
            }
            
            if (window.analytics) {
                analytics.track('bulk_action', { action: 'delete', count: count });
            }
        }
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }
}

const bulkOperations = new BulkOperations();
window.bulkOperations = bulkOperations;
