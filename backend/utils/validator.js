const validator = {
    sanitizeString(input) {
        if (typeof input !== 'string') return '';
        return input.trim().replace(/[<>]/g, '');
    },
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    validatePath(path) {
        if (typeof path !== 'string') return false;
        
        const dangerousPatterns = [
            /\.\./,
            /\/\//,
            /^\/etc\//,
            /^\/proc\//,
            /^\/sys\//,
            /^\/dev\//,
            /^C:\\Windows\\/i,
            /^C:\\System32\\/i
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(path));
    },
    
    validateFilename(filename) {
        if (typeof filename !== 'string') return false;
        
        const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
        const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 
                               'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 
                               'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
        
        if (invalidChars.test(filename)) return false;
        if (reservedNames.includes(filename.toUpperCase())) return false;
        if (filename.length > 255) return false;
        if (filename.trim().length === 0) return false;
        
        return true;
    },
    
    validateUsername(username) {
        if (typeof username !== 'string') return false;
        
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        return usernameRegex.test(username);
    },
    
    validatePassword(password) {
        if (typeof password !== 'string') return false;
        if (password.length < 6) return false;
        if (password.length > 200) return false;
        
        return true;
    },
    
    sanitizeHTML(html) {
        if (typeof html !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },
    
    validateJSON(jsonString) {
        try {
            JSON.parse(jsonString);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    validateFileSize(size, maxSize) {
        return typeof size === 'number' && size >= 0 && size <= maxSize;
    },
    
    validateFileType(filename, allowedTypes) {
        if (!Array.isArray(allowedTypes) || allowedTypes.length === 0) return true;
        
        const extension = filename.split('.').pop()?.toLowerCase();
        return allowedTypes.includes(extension);
    },
    
    sanitizeObject(obj) {
        if (typeof obj !== 'object' || obj === null) return {};
        
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            const sanitizedKey = this.sanitizeString(key);
            if (typeof value === 'string') {
                sanitized[sanitizedKey] = this.sanitizeString(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[sanitizedKey] = this.sanitizeObject(value);
            } else {
                sanitized[sanitizedKey] = value;
            }
        }
        
        return sanitized;
    },
    
    validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    validateInteger(value, min = null, max = null) {
        const num = parseInt(value, 10);
        if (isNaN(num)) return false;
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        return true;
    },
    
    validateFloat(value, min = null, max = null) {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        return true;
    }
};

module.exports = validator;
