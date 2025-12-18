(function() {
    // Create error container
    const errorContainer = document.createElement('div');
    errorContainer.id = 'debug-console';
    errorContainer.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 200px;
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        font-family: monospace;
        font-size: 12px;
        padding: 10px;
        overflow-y: auto;
        z-index: 99999;
        display: none; /* Hidden by default, toggle with Ctrl+Shift+D */
        border-top: 2px solid #00ff00;
    `;
    document.body.appendChild(errorContainer);

    // Override console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    function appendLog(type, args) {
        const line = document.createElement('div');
        line.style.color = type === 'error' ? '#ff5555' : type === 'warn' ? '#ffff55' : '#00ff00';
        line.textContent = `[${new Date().toLocaleTimeString()}] [${type.toUpperCase()}] ${Array.from(args).map(a => 
            typeof a === 'object' ? JSON.stringify(a) : String(a)
        ).join(' ')}`;
        errorContainer.appendChild(line);
        errorContainer.scrollTop = errorContainer.scrollHeight;
    }

    console.log = function(...args) {
        originalLog.apply(console, args);
        appendLog('log', args);
    };

    console.error = function(...args) {
        originalError.apply(console, args);
        appendLog('error', args);
        // Auto-show on error
        errorContainer.style.display = 'block';
    };

    console.warn = function(...args) {
        originalWarn.apply(console, args);
        appendLog('warn', args);
    };

    // Catch unhandled errors
    window.addEventListener('error', function(event) {
        console.error('Global Error:', event.message, 'at', event.filename, ':', event.lineno);
    });

    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled Promise Rejection:', event.reason);
    });

    // Toggle key
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            errorContainer.style.display = errorContainer.style.display === 'none' ? 'block' : 'none';
        }
    });

    console.log('Debug console initialized. Press Ctrl+Shift+D to toggle.');
})();

