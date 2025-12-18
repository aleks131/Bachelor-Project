(function() {
    const VERSION = '2.0.3';
    const TIMESTAMP = Date.now();
    
    function addCacheBuster() {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        const scripts = document.querySelectorAll('script[src]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.includes('?') && !href.startsWith('http') && !href.startsWith('//')) {
                const separator = href.includes('?') ? '&' : '?';
                link.setAttribute('href', href + separator + 'v=' + VERSION + '&t=' + TIMESTAMP);
            }
        });
        
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            if (src && !src.includes('?') && !src.startsWith('http') && !src.startsWith('//')) {
                const separator = src.includes('?') ? '&' : '?';
                script.setAttribute('src', src + separator + 'v=' + VERSION + '&t=' + TIMESTAMP);
            }
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addCacheBuster);
    } else {
        addCacheBuster();
    }
    
    window.addEventListener('load', () => {
        const images = document.querySelectorAll('img[src]');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.includes('?') && !src.startsWith('data:') && !src.startsWith('http')) {
                const separator = src.includes('?') ? '&' : '?';
                img.setAttribute('src', src + separator + 'v=' + VERSION + '&t=' + TIMESTAMP);
            }
        });
    });
})();

