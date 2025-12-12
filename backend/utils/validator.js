const path = require('path');
const fs = require('fs');

class Validator {
    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { valid: false, error: 'Username is required' };
        }
        
        if (username.length < 3 || username.length > 50) {
            return { valid: false, error: 'Username must be between 3 and 50 characters' };
        }
        
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
        }
        
        return { valid: true };
    }
    
    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, error: 'Password is required' };
        }
        
        if (password.length < 6) {
            return { valid: false, error: 'Password must be at least 6 characters' };
        }
        
        if (password.length > 128) {
            return { valid: false, error: 'Password must be less than 128 characters' };
        }
        
        return { valid: true };
    }
    
    validateRole(role) {
        const validRoles = ['admin', 'manager', 'operator'];
        if (!validRoles.includes(role)) {
            return { valid: false, error: `Role must be one of: ${validRoles.join(', ')}` };
        }
        return { valid: true };
    }
    
    validateNetworkPath(pathString) {
        if (!pathString || typeof pathString !== 'string') {
            return { valid: false, error: 'Path is required' };
        }
        
        if (pathString.length > 500) {
            return { valid: false, error: 'Path is too long' };
        }
        
        try {
            const normalized = path.normalize(pathString);
            
            if (normalized.includes('..')) {
                return { valid: false, error: 'Path cannot contain parent directory references' };
            }
            
            if (fs.existsSync(normalized)) {
                try {
                    fs.accessSync(normalized, fs.constants.R_OK);
                    return { valid: true, normalized };
                } catch {
                    return { valid: false, error: 'Path exists but is not accessible' };
                }
            }
            
            return { valid: true, normalized, warning: 'Path does not exist' };
        } catch (error) {
            return { valid: false, error: `Invalid path: ${error.message}` };
        }
    }
    
    validateEmail(email) {
        if (!email) return { valid: true };
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valid: false, error: 'Invalid email format' };
        }
        
        return { valid: true };
    }
    
    validatePort(port) {
        const portNum = parseInt(port);
        if (isNaN(portNum)) {
            return { valid: false, error: 'Port must be a number' };
        }
        
        if (portNum < 1 || portNum > 65535) {
            return { valid: false, error: 'Port must be between 1 and 65535' };
        }
        
        return { valid: true, port: portNum };
    }
    
    validateFileExtension(filename, allowedExtensions) {
        if (!allowedExtensions || allowedExtensions.length === 0) {
            return { valid: true };
        }
        
        const ext = path.extname(filename).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            return {
                valid: false,
                error: `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`
            };
        }
        
        return { valid: true };
    }
    
    validateFileSize(fileSize, maxSize) {
        if (fileSize > maxSize) {
            const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
            return {
                valid: false,
                error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`
            };
        }
        
        return { valid: true };
    }
    
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        return input
            .replace(/[<>]/g, '')
            .trim()
            .substring(0, 10000);
    }
    
    validateLayoutData(layoutData) {
        if (!layoutData || typeof layoutData !== 'object') {
            return { valid: false, error: 'Layout data is required' };
        }
        
        if (!layoutData.name || typeof layoutData.name !== 'string') {
            return { valid: false, error: 'Layout name is required' };
        }
        
        if (layoutData.name.length > 100) {
            return { valid: false, error: 'Layout name is too long' };
        }
        
        if (!Array.isArray(layoutData.widgets)) {
            return { valid: false, error: 'Layout widgets must be an array' };
        }
        
        return { valid: true };
    }
    
    validateJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            return { valid: true, data: parsed };
        } catch (error) {
            return { valid: false, error: `Invalid JSON: ${error.message}` };
        }
    }
}

module.exports = new Validator();




