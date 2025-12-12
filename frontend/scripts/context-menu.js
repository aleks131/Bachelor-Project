class ContextMenu {
    constructor() {
        this.menu = null;
        this.currentTarget = null;
        this.init();
    }

    init() {
        this.createMenu();
        this.setupDocumentListeners();
    }

    createMenu() {
        this.menu = document.createElement('div');
        this.menu.id = 'context-menu';
        this.menu.className = 'context-menu';
        this.menu.innerHTML = '<ul class="context-menu-list"></ul>';
        document.body.appendChild(this.menu);
    }

    setupDocumentListeners() {
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) {
                this.hide();
            }
        });

        document.addEventListener('contextmenu', (e) => {
            const target = e.target.closest('[data-context-menu]');
            if (target) {
                e.preventDefault();
                this.show(e, target);
            }
        });
    }

    show(event, target) {
        const menuType = target.dataset.contextMenu;
        const menuItems = this.getMenuItems(menuType, target);

        if (menuItems.length === 0) {
            return;
        }

        this.currentTarget = target;
        
        const list = this.menu.querySelector('.context-menu-list');
        list.innerHTML = menuItems.map(item => `
            <li class="context-menu-item ${item.danger ? 'danger' : ''}" 
                ${item.disabled ? 'disabled' : ''}
                data-action="${item.action}">
                <i class="${item.icon}"></i>
                <span>${item.label}</span>
            </li>
        `).join('');

        this.menu.style.display = 'block';
        this.positionMenu(event);

        list.querySelectorAll('.context-menu-item:not([disabled])').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.dataset.action;
                this.handleAction(action, target);
                this.hide();
            });
        });
    }

    hide() {
        this.menu.style.display = 'none';
        this.currentTarget = null;
    }

    positionMenu(event) {
        const rect = this.menu.getBoundingClientRect();
        let x = event.clientX;
        let y = event.clientY;

        if (x + rect.width > window.innerWidth) {
            x = window.innerWidth - rect.width - 10;
        }

        if (y + rect.height > window.innerHeight) {
            y = window.innerHeight - rect.height - 10;
        }

        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;
    }

    getMenuItems(menuType, target) {
        const filePath = target.dataset.filePath || target.dataset.path;
        const isDirectory = target.dataset.isDirectory === 'true';

        const baseItems = [
            {
                label: 'Preview',
                icon: 'fas fa-eye',
                action: 'preview'
            },
            {
                label: 'Open',
                icon: 'fas fa-folder-open',
                action: 'open'
            },
            {
                type: 'separator'
            }
        ];

        const fileItems = [
            {
                label: 'Rename',
                icon: 'fas fa-edit',
                action: 'rename'
            },
            {
                label: 'Copy',
                icon: 'fas fa-copy',
                action: 'copy'
            },
            {
                label: 'Move',
                icon: 'fas fa-cut',
                action: 'move'
            },
            {
                type: 'separator'
            },
            {
                label: 'Download',
                icon: 'fas fa-download',
                action: 'download'
            },
            {
                type: 'separator'
            },
            {
                label: 'Delete',
                icon: 'fas fa-trash',
                action: 'delete',
                danger: true
            }
        ];

        if (menuType === 'file') {
            return [...baseItems, ...fileItems];
        } else if (menuType === 'folder') {
            return [
                ...baseItems,
                {
                    label: 'Rename',
                    icon: 'fas fa-edit',
                    action: 'rename'
                },
                {
                    label: 'Copy',
                    icon: 'fas fa-copy',
                    action: 'copy'
                },
                {
                    label: 'Move',
                    icon: 'fas fa-cut',
                    action: 'move'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Delete',
                    icon: 'fas fa-trash',
                    action: 'delete',
                    danger: true
                }
            ];
        }

        return [];
    }

    async handleAction(action, target) {
        const filePath = target.dataset.filePath || target.dataset.path;
        const fileName = filePath?.split(/[/\\]/).pop() || '';

        switch (action) {
            case 'preview':
                if (filePath && window.filePreview) {
                    await filePreview.show(filePath);
                }
                break;

            case 'open':
                if (target.dataset.isDirectory === 'true') {
                    // Navigate to folder
                    if (window.onFolderOpen) {
                        window.onFolderOpen(filePath);
                    }
                } else {
                    // Open file
                    window.open(`/api/files/preview?filePath=${encodeURIComponent(filePath)}`, '_blank');
                }
                break;

            case 'rename':
                const newName = prompt('Enter new name:', fileName);
                if (newName && newName !== fileName && window.fileManagement) {
                    await fileManagement.renameFile(filePath, newName);
                    if (window.onFileRenamed) {
                        window.onFileRenamed(filePath, newName);
                    }
                }
                break;

            case 'copy':
                const copyDest = prompt('Enter destination path:', path.dirname(filePath));
                if (copyDest && window.fileManagement) {
                    await fileManagement.copyFile(filePath, path.join(copyDest, fileName));
                }
                break;

            case 'move':
                const moveDest = prompt('Enter destination path:');
                if (moveDest && window.fileManagement) {
                    await fileManagement.moveFile(filePath, path.join(moveDest, fileName));
                    if (window.onFileMoved) {
                        window.onFileMoved(filePath, moveDest);
                    }
                }
                break;

            case 'download':
                window.open(`/api/files/preview?filePath=${encodeURIComponent(filePath)}&download=true`, '_blank');
                break;

            case 'delete':
                if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
                    if (window.fileManagement) {
                        await fileManagement.deleteFile(filePath);
                        if (window.onFileDeleted) {
                            window.onFileDeleted(filePath);
                        }
                    }
                }
                break;
        }

        if (window.analytics) {
            analytics.track('context_menu_action', { action, filePath });
        }
    }
}

const contextMenu = new ContextMenu();
window.contextMenu = contextMenu;



