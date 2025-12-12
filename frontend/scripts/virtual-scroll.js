class VirtualScroll {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            itemHeight: options.itemHeight || 100,
            buffer: options.buffer || 5,
            renderItem: options.renderItem || null,
            ...options
        };
        
        this.items = [];
        this.visibleStart = 0;
        this.visibleEnd = 0;
        this.scrollTop = 0;
        
        this.init();
    }

    init() {
        this.setupContainer();
        this.setupScrollListener();
        this.update();
    }

    setupContainer() {
        this.container.style.position = 'relative';
        this.container.style.overflow = 'auto';
        
        this.viewport = document.createElement('div');
        this.viewport.className = 'virtual-scroll-viewport';
        this.viewport.style.position = 'relative';
        
        this.content = document.createElement('div');
        this.content.className = 'virtual-scroll-content';
        
        this.viewport.appendChild(this.content);
        this.container.appendChild(this.viewport);
    }

    setupScrollListener() {
        this.container.addEventListener('scroll', () => {
            this.scrollTop = this.container.scrollTop;
            this.update();
        });

        window.addEventListener('resize', () => {
            this.update();
        });
    }

    setItems(items) {
        this.items = items;
        this.update();
    }

    addItem(item) {
        this.items.push(item);
        this.update();
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.update();
    }

    update() {
        if (!this.options.renderItem || this.items.length === 0) {
            this.content.innerHTML = '';
            this.content.style.height = '0px';
            return;
        }

        const containerHeight = this.container.clientHeight;
        const itemHeight = this.options.itemHeight;
        const buffer = this.options.buffer;

        const totalHeight = this.items.length * itemHeight;
        this.content.style.height = `${totalHeight}px`;

        const visibleStart = Math.max(0, Math.floor(this.scrollTop / itemHeight) - buffer);
        const visibleEnd = Math.min(
            this.items.length - 1,
            Math.ceil((this.scrollTop + containerHeight) / itemHeight) + buffer
        );

        this.visibleStart = visibleStart;
        this.visibleEnd = visibleEnd;

        this.render();
    }

    render() {
        const itemHeight = this.options.itemHeight;
        const offsetY = this.visibleStart * itemHeight;

        this.content.style.transform = `translateY(${offsetY}px)`;

        const visibleItems = this.items.slice(this.visibleStart, this.visibleEnd + 1);
        
        this.content.innerHTML = visibleItems.map((item, index) => {
            const actualIndex = this.visibleStart + index;
            return this.options.renderItem(item, actualIndex);
        }).join('');

        this.attachEventListeners();
    }

    attachEventListeners() {
        if (this.options.onItemClick) {
            this.content.querySelectorAll('.virtual-scroll-item').forEach((item, index) => {
                item.addEventListener('click', () => {
                    const actualIndex = this.visibleStart + index;
                    this.options.onItemClick(this.items[actualIndex], actualIndex);
                });
            });
        }
    }

    scrollToIndex(index) {
        const itemHeight = this.options.itemHeight;
        const scrollTop = index * itemHeight;
        this.container.scrollTop = scrollTop;
        this.update();
    }

    scrollToTop() {
        this.container.scrollTop = 0;
        this.update();
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
        this.update();
    }

    getVisibleItems() {
        return this.items.slice(this.visibleStart, this.visibleEnd + 1);
    }

    destroy() {
        this.container.removeEventListener('scroll', this.update);
        window.removeEventListener('resize', this.update);
        this.container.innerHTML = '';
    }
}

window.VirtualScroll = VirtualScroll;



