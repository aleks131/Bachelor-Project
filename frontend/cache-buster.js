const APP_VERSION = '2.0.1';
const CACHE_BUST = `?v=${APP_VERSION}&t=${Date.now()}`;

function addCacheBuster() {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    const scripts = document.querySelectorAll('script[src]');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('?') && !href.startsWith('http')) {
            link.setAttribute('href', href + CACHE_BUST);
        }
    });
    
    scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.includes('?') && !src.startsWith('http')) {
            script.setAttribute('src', src + CACHE_BUST);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCacheBuster);
} else {
    addCacheBuster();
}


