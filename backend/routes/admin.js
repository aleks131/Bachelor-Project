const express = require('express');
const auth = require('../auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const requireAdmin = (req, res, next) => {
    if (req.session && req.session.userId) {
        const user = auth.getUserById(req.session.userId);
        if (user && user.role === 'admin') {
            req.user = user;
            return next();
        }
    }
    res.status(403).json({ error: 'Admin access required' });
};

router.get('/users', requireAdmin, (req, res) => {
    try {
        const users = auth.getAllUsers();
        const usersWithoutPasswords = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        res.json({ users: usersWithoutPasswords });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/users/:id', requireAdmin, (req, res) => {
    try {
        const user = auth.getUserById(parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.post('/users', requireAdmin, async (req, res) => {
    try {
        const { username, password, role, allowedApps, networkPaths } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        const existingUser = auth.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        const hashedPassword = await auth.hashPassword(password);
        const newUser = auth.createUser({
            username,
            password: hashedPassword,
            role: role || 'operator',
            allowedApps: allowedApps || [],
            networkPaths: networkPaths || {}
        });
        
        if (!newUser) {
            return res.status(500).json({ error: 'Failed to create user' });
        }
        
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

router.put('/users/:id', requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { username, password, role, allowedApps, networkPaths } = req.body;
        
        const updates = {};
        if (username) updates.username = username;
        if (role) updates.role = role;
        if (allowedApps) updates.allowedApps = allowedApps;
        if (networkPaths) updates.networkPaths = networkPaths;
        
        if (password) {
            updates.password = await auth.hashPassword(password);
        }
        
        const updatedUser = auth.updateUser(userId, updates);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

router.delete('/users/:id', requireAdmin, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        if (userId === req.session.userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        
        const success = auth.deleteUser(userId);
        if (!success) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

router.post('/test-path', requireAdmin, (req, res) => {
    try {
        const { path: testPath } = req.body;
        
        if (!testPath) {
            return res.status(400).json({ error: 'Path is required' });
        }
        
        const normalizedPath = path.normalize(testPath);
        const exists = fs.existsSync(normalizedPath);
        
        let isDirectory = false;
        let isReadable = false;
        let files = [];
        
        if (exists) {
            const stats = fs.statSync(normalizedPath);
            isDirectory = stats.isDirectory();
            
            if (isDirectory) {
                try {
                    files = fs.readdirSync(normalizedPath);
                    isReadable = true;
                } catch (error) {
                    isReadable = false;
                }
            }
        }
        
        res.json({
            exists,
            isDirectory,
            isReadable,
            path: normalizedPath,
            fileCount: isDirectory ? files.length : 0
        });
    } catch (error) {
        console.error('Error testing path:', error);
        res.status(500).json({ 
            error: 'Failed to test path',
            message: error.message 
        });
    }
});

router.get('/config', requireAdmin, (req, res) => {
    try {
        const config = require('../../data/config.json');
        res.json({ config });
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

router.put('/config', requireAdmin, (req, res) => {
    try {
        const configPath = path.join(__dirname, '../../data/config.json');
        const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const updatedConfig = { ...currentConfig, ...req.body };
        
        fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
        res.json({ config: updatedConfig });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ error: 'Failed to update config' });
    }
});

module.exports = router;
