document.addEventListener('DOMContentLoaded', () => {
    initSkeletonLoaders();
    initScrollAnimations();
    initEnhancedTooltips();
    initPageTransitions();
});

function initSkeletonLoaders() {
    const skeletonElements = document.querySelectorAll('.skeleton');
    skeletonElements.forEach(el => {
        setTimeout(() => {
            el.classList.remove('skeleton');
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 300);
        }, 1000);
    });
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

function initEnhancedTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = element.getAttribute('data-tooltip');
        
        const position = element.getAttribute('data-tooltip-position') || 'top';
        tooltip.classList.add(`tooltip-${position}`);
        
        const container = document.createElement('div');
        container.className = 'tooltip-container';
        element.parentNode.insertBefore(container, element);
        container.appendChild(element);
        container.appendChild(tooltip);
    });
}

function initPageTransitions() {
    document.querySelectorAll('a[href^="/"], a[href^="./"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && !href.startsWith('#')) {
                const mainContent = document.querySelector('main, .main-content, .dashboard-main');
                if (mainContent) {
                    mainContent.classList.add('page-transition-exit');
                }
            }
        });
    });
}

function showEmptyState(container, icon, title, description, actionButton) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
        <div class="empty-state-icon">${icon}</div>
        <h3 class="empty-state-title">${title}</h3>
        <p class="empty-state-description">${description}</p>
        ${actionButton ? `<div class="empty-state-action">${actionButton}</div>` : ''}
    `;
    
    container.innerHTML = '';
    container.appendChild(emptyState);
    return emptyState;
}

function createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'skeleton skeleton-card';
    return card;
}

function createSkeletonText(width = '100%') {
    const text = document.createElement('div');
    text.className = 'skeleton skeleton-text';
    text.style.width = width;
    return text;
}

function createSkeletonImage() {
    const image = document.createElement('div');
    image.className = 'skeleton skeleton-image';
    return image;
}

window.enhancedUI = {
    showEmptyState,
    createSkeletonCard,
    createSkeletonText,
    createSkeletonImage
};

