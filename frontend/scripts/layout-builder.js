class LayoutBuilder {
    constructor() {
        this.widgets = [];
        this.selectedWidget = null;
        this.currentLayout = {
            name: '',
            description: '',
            widgets: [],
            isGlobal: false
        };
        this.availableWidgets = [];
        this.users = [];
        
        this.initialize();
    }

    async initialize() {
        await this.checkAdminAccess();
        await this.loadAvailableWidgets();
        await this.loadUsers();
        this.setupEventListeners();
        this.setupCanvas();
    }

    async checkAdminAccess() {
        try {
            const response = await fetch('/api/current-user');
            if (!response.ok) {
                window.location.href = '/';
                return;
            }
            
            const data = await response.json();
            if (data.user.role !== 'admin') {
                alert('Admin access required');
                window.location.href = '/admin';
                return;
            }
        } catch (error) {
            console.error('Error checking admin access:', error);
            window.location.href = '/';
        }
    }

    async loadAvailableWidgets() {
        try {
            const response = await fetch('/api/layouts/widgets/list');
            const data = await response.json();
            this.availableWidgets = data.widgets;
            this.renderWidgetPalette();
        } catch (error) {
            console.error('Error loading widgets:', error);
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            this.users = data.users;
            
            const select = document.getElementById('save-layout-user');
            if (select) {
                this.users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${user.username} (${user.role})`;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    renderWidgetPalette() {
        const categories = {
            display: document.getElementById('display-widgets'),
            navigation: document.getElementById('navigation-widgets'),
            utility: document.getElementById('utility-widgets')
        };

        this.availableWidgets.forEach(widget => {
            const category = categories[widget.category] || categories.display;
            if (!category) return;

            const widgetItem = document.createElement('div');
            widgetItem.className = 'widget-item';
            widgetItem.draggable = true;
            widgetItem.dataset.widgetId = widget.id;
            widgetItem.innerHTML = `
                <i class="${widget.icon}"></i>
                <span class="widget-item-name">${widget.name}</span>
            `;

            widgetItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('widgetId', widget.id);
                e.dataTransfer.effectAllowed = 'copy';
            });

            category.appendChild(widgetItem);
        });
    }

    setupCanvas() {
        const canvas = document.getElementById('canvas-grid');
        
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const widgetId = e.dataTransfer.getData('widgetId');
            if (widgetId) {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.addWidgetToCanvas(widgetId, x, y);
            }
        });
    }

    async addWidgetToCanvas(widgetId, x, y) {
        const widget = this.availableWidgets.find(w => w.id === widgetId);
        if (!widget) return;

        try {
            const schemaResponse = await fetch(`/api/layouts/widgets/${widgetId}/schema`);
            const schemaData = await schemaResponse.json();
            const schema = schemaData.schema;

            const widgetConfig = this.createDefaultConfig(schema);
            const widgetInstance = {
                id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: widgetId,
                name: widget.name,
                config: widgetConfig,
                position: { x: Math.floor(x / 40) * 40, y: Math.floor(y / 40) * 40 },
                size: { width: 400, height: 300 }
            };

            this.widgets.push(widgetInstance);
            this.renderWidget(widgetInstance);
            this.selectWidget(widgetInstance);
        } catch (error) {
            console.error('Error adding widget:', error);
            alert('Failed to add widget. Please try again.');
        }
    }

    createDefaultConfig(schema) {
        const config = {};
        Object.keys(schema.properties).forEach(key => {
            const prop = schema.properties[key];
            config[key] = prop.default !== undefined ? prop.default : 
                         prop.type === 'boolean' ? false :
                         prop.type === 'array' ? [] :
                         prop.type === 'number' ? 0 : '';
        });
        return config;
    }

    renderWidget(widgetInstance) {
        const canvas = document.getElementById('canvas-grid');
        const canvasPlaceholder = canvas.querySelector('.canvas-placeholder');
        if (canvasPlaceholder) {
            canvasPlaceholder.remove();
        }

        const widgetEl = document.createElement('div');
        widgetEl.className = 'widget-instance';
        widgetEl.id = widgetInstance.id;
        widgetEl.style.left = `${widgetInstance.position.x}px`;
        widgetEl.style.top = `${widgetInstance.position.y}px`;
        widgetEl.style.width = `${widgetInstance.size.width}px`;
        widgetEl.style.height = `${widgetInstance.size.height}px`;
        widgetEl.dataset.widgetId = widgetInstance.id;

        widgetEl.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    <i class="${this.availableWidgets.find(w => w.id === widgetInstance.type)?.icon || 'fas fa-cube'}"></i>
                    ${widgetInstance.name}
                </div>
                <div class="widget-actions">
                    <button class="widget-action-btn" onclick="layoutBuilder.configureWidget('${widgetInstance.id}')" title="Configure">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="widget-action-btn" onclick="layoutBuilder.deleteWidget('${widgetInstance.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content">
                ${this.getWidgetPreview(widgetInstance)}
            </div>
            <div class="widget-resize-handle"></div>
        `;

        widgetEl.addEventListener('click', (e) => {
            if (!e.target.closest('.widget-actions')) {
                this.selectWidget(widgetInstance);
            }
        });

        canvas.appendChild(widgetEl);
        this.makeWidgetResizable(widgetEl, widgetInstance);
        this.makeWidgetDraggable(widgetEl, widgetInstance);
    }

    getWidgetPreview(widgetInstance) {
        const previews = {
            'image-viewer': '<i class="fas fa-image fa-2x"></i><br>Image Viewer',
            'file-browser': '<i class="fas fa-folder-open fa-2x"></i><br>File Browser',
            'folder-scanner': '<i class="fas fa-search fa-2x"></i><br>Folder Scanner',
            'kpi-card': '<i class="fas fa-chart-line fa-2x"></i><br>KPI Card',
            'slideshow': '<i class="fas fa-images fa-2x"></i><br>Slideshow',
            'custom-html': '<i class="fas fa-code fa-2x"></i><br>Custom HTML',
            'text-display': '<i class="fas fa-font fa-2x"></i><br>Text Display'
        };
        return previews[widgetInstance.type] || '<i class="fas fa-cube fa-2x"></i>';
    }

    makeWidgetDraggable(element, widgetInstance) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        const header = element.querySelector('.widget-header');
        if (!header) return;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.widget-actions')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = widgetInstance.position.x;
            initialY = widgetInstance.position.y;

            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', stopDrag);
        });

        const handleDrag = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            const newX = Math.max(0, Math.floor((initialX + dx) / 40) * 40);
            const newY = Math.max(0, Math.floor((initialY + dy) / 40) * 40);
            
            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
            widgetInstance.position.x = newX;
            widgetInstance.position.y = newY;
        };

        const stopDrag = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', stopDrag);
        };
    }

    makeWidgetResizable(element, widgetInstance) {
        const handle = element.querySelector('.widget-resize-handle');
        if (!handle) return;

        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = widgetInstance.size.width;
            startHeight = widgetInstance.size.height;

            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
        });

        const handleResize = (e) => {
            if (!isResizing) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            widgetInstance.size.width = Math.max(200, startWidth + dx);
            widgetInstance.size.height = Math.max(150, startHeight + dy);
            
            element.style.width = `${widgetInstance.size.width}px`;
            element.style.height = `${widgetInstance.size.height}px`;
        };

        const stopResize = () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
        };
    }

    selectWidget(widgetInstance) {
        document.querySelectorAll('.widget-instance').forEach(el => {
            el.classList.remove('selected');
        });

        const element = document.getElementById(widgetInstance.id);
        if (element) {
            element.classList.add('selected');
        }

        this.selectedWidget = widgetInstance;
        this.renderProperties(widgetInstance);
    }

    renderProperties(widgetInstance) {
        const container = document.getElementById('properties-content');
        if (!container) return;

        container.innerHTML = `
            <div class="property-group">
                <label>Widget Type</label>
                <input type="text" value="${widgetInstance.name}" disabled>
            </div>
            <div class="property-row">
                <div class="property-group">
                    <label>X Position</label>
                    <input type="number" value="${widgetInstance.position.x}" 
                           onchange="layoutBuilder.updatePosition('${widgetInstance.id}', 'x', this.value)">
                </div>
                <div class="property-group">
                    <label>Y Position</label>
                    <input type="number" value="${widgetInstance.position.y}" 
                           onchange="layoutBuilder.updatePosition('${widgetInstance.id}', 'y', this.value)">
                </div>
            </div>
            <div class="property-row">
                <div class="property-group">
                    <label>Width</label>
                    <input type="number" value="${widgetInstance.size.width}" 
                           onchange="layoutBuilder.updateSize('${widgetInstance.id}', 'width', this.value)">
                </div>
                <div class="property-group">
                    <label>Height</label>
                    <input type="number" value="${widgetInstance.size.height}" 
                           onchange="layoutBuilder.updateSize('${widgetInstance.id}', 'height', this.value)">
                </div>
            </div>
            <button class="btn btn-primary" onclick="layoutBuilder.configureWidget('${widgetInstance.id}')" style="width: 100%; margin-top: 1rem;">
                <i class="fas fa-cog"></i> Configure Widget
            </button>
        `;
    }

    updatePosition(widgetId, axis, value) {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) return;

        widget.position[axis] = parseInt(value) || 0;
        const element = document.getElementById(widgetId);
        if (element) {
            element.style[axis === 'x' ? 'left' : 'top'] = `${widget.position[axis]}px`;
        }
    }

    updateSize(widgetId, dimension, value) {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) return;

        widget.size[dimension] = Math.max(100, parseInt(value) || 100);
        const element = document.getElementById(widgetId);
        if (element) {
            element.style[dimension] = `${widget.size[dimension]}px`;
        }
    }

    async configureWidget(widgetId) {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) return;

        try {
            const schemaResponse = await fetch(`/api/layouts/widgets/${widget.type}/schema`);
            const schemaData = await schemaResponse.json();
            const schema = schemaData.schema;

            const modal = document.getElementById('widget-config-modal');
            document.getElementById('config-modal-title').textContent = `Configure ${widget.name}`;
            
            const form = document.getElementById('widget-config-form');
            form.innerHTML = '';

            Object.keys(schema.properties).forEach(key => {
                const prop = schema.properties[key];
                const value = widget.config[key] !== undefined ? widget.config[key] : 
                             prop.default !== undefined ? prop.default : '';

                const group = document.createElement('div');
                group.className = 'form-group';
                
                const label = document.createElement('label');
                label.textContent = prop.label + (prop.required ? ' *' : '');
                group.appendChild(label);

                if (prop.type === 'boolean') {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `config-${key}`;
                    checkbox.checked = value;
                    label.htmlFor = checkbox.id;
                    label.prepend(checkbox);
                    group.appendChild(label);
                } else if (prop.type === 'array') {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = `config-${key}`;
                    input.value = Array.isArray(value) ? value.join(', ') : '';
                    input.placeholder = 'Comma-separated values';
                    group.appendChild(input);
                } else if (prop.multiline) {
                    const textarea = document.createElement('textarea');
                    textarea.id = `config-${key}`;
                    textarea.value = value;
                    textarea.rows = 5;
                    group.appendChild(textarea);
                } else {
                    const input = document.createElement('input');
                    input.type = prop.type === 'number' ? 'number' : 'text';
                    input.id = `config-${key}`;
                    input.value = value;
                    input.required = prop.required || false;
                    group.appendChild(input);
                }

                form.appendChild(group);
            });

            modal.classList.add('active');

            document.getElementById('save-config-btn').onclick = () => {
                const newConfig = {};
                Object.keys(schema.properties).forEach(key => {
                    const input = document.getElementById(`config-${key}`);
                    if (!input) return;

                    const prop = schema.properties[key];
                    if (prop.type === 'boolean') {
                        newConfig[key] = input.checked;
                    } else if (prop.type === 'number') {
                        newConfig[key] = parseFloat(input.value) || 0;
                    } else if (prop.type === 'array') {
                        newConfig[key] = input.value.split(',').map(s => s.trim()).filter(s => s);
                    } else {
                        newConfig[key] = input.value;
                    }
                });

                widget.config = { ...widget.config, ...newConfig };
                modal.classList.remove('active');
                this.selectWidget(widget);
            };

            document.getElementById('cancel-config-btn').onclick = () => {
                modal.classList.remove('active');
            };
        } catch (error) {
            console.error('Error configuring widget:', error);
            alert('Failed to load widget configuration');
        }
    }

    deleteWidget(widgetId) {
        if (!confirm('Delete this widget?')) return;

        this.widgets = this.widgets.filter(w => w.id !== widgetId);
        const element = document.getElementById(widgetId);
        if (element) {
            element.remove();
        }

        if (this.selectedWidget?.id === widgetId) {
            this.selectedWidget = null;
            document.getElementById('properties-content').innerHTML = 
                '<p class="no-selection">Select a widget to edit its properties</p>';
        }
    }

    setupEventListeners() {
        document.getElementById('back-to-admin').addEventListener('click', () => {
            window.location.href = '/admin';
        });

        document.getElementById('save-layout-btn').addEventListener('click', () => {
            this.showSaveModal();
        });

        document.getElementById('preview-layout-btn').addEventListener('click', () => {
            this.previewLayout();
        });

        document.getElementById('close-save-modal').addEventListener('click', () => {
            document.getElementById('save-layout-modal').classList.remove('active');
        });

        document.getElementById('close-preview-modal').addEventListener('click', () => {
            document.getElementById('preview-modal').classList.remove('active');
        });

        document.getElementById('confirm-save-btn').addEventListener('click', () => {
            this.saveLayout();
        });
    }

    showSaveModal() {
        const name = document.getElementById('layout-name').value || 'Untitled Layout';
        document.getElementById('save-layout-name').value = name;
        document.getElementById('save-layout-desc').value = document.getElementById('layout-description').value;
        document.getElementById('save-layout-modal').classList.add('active');
    }

    async saveLayout() {
        const name = document.getElementById('save-layout-name').value;
        const description = document.getElementById('save-layout-desc').value;
        const isGlobal = document.getElementById('save-layout-global').checked;
        const userId = document.getElementById('save-layout-user').value || null;

        if (!name.trim()) {
            alert('Layout name is required');
            return;
        }

        try {
            const layout = {
                name,
                description,
                widgets: this.widgets,
                isGlobal,
                userId: userId ? parseInt(userId) : null
            };

            const response = await fetch('/api/layouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(layout)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save layout');
            }

            const data = await response.json();
            alert('Layout saved successfully!');
            document.getElementById('save-layout-modal').classList.remove('active');
            
            // Update layout name in toolbar
            document.getElementById('layout-name').value = name;
            document.getElementById('layout-description').value = description;
        } catch (error) {
            console.error('Error saving layout:', error);
            alert(error.message || 'Failed to save layout');
        }
    }

    previewLayout() {
        const container = document.getElementById('preview-container');
        container.innerHTML = '';
        
        this.widgets.forEach(widget => {
            const widgetEl = document.createElement('div');
            widgetEl.className = 'widget-instance';
            widgetEl.style.width = `${widget.size.width}px`;
            widgetEl.style.height = `${widget.size.height}px`;
            widgetEl.innerHTML = `
                <div class="widget-header">
                    <div class="widget-title">
                        <i class="${this.availableWidgets.find(w => w.id === widget.type)?.icon || 'fas fa-cube'}"></i>
                        ${widget.name}
                    </div>
                </div>
                <div class="widget-content">
                    ${this.getWidgetPreview(widget)}
                </div>
            `;
            container.appendChild(widgetEl);
        });

        document.getElementById('preview-modal').classList.add('active');
    }
}

let layoutBuilder;
window.addEventListener('DOMContentLoaded', () => {
    layoutBuilder = new LayoutBuilder();
    window.layoutBuilder = layoutBuilder; // Make it globally accessible
});
