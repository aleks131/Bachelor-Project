const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

function loadUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading users:', error);
        return { users: [], defaultPassword: 'admin123' };
    }
}

function saveUsers(usersData) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

async function authenticateUser(username, password) {
    const usersData = loadUsers();
    const user = usersData.users.find(u => u.username === username);
    
    if (!user) {
        return { success: false, message: 'Invalid username or password' };
    }
    
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
        return { success: false, message: 'Invalid username or password' };
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
}


function getUserById(userId) {
    const usersData = loadUsers();
    const user = usersData.users.find(u => u.id === userId);
    
    if (!user) {
        return null;
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

function getAllUsers() {
    const usersData = loadUsers();
    return usersData.users.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
}

function updateUserLastApp(userId, appName) {
    const usersData = loadUsers();
    const userIndex = usersData.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return false;
    }
    
    usersData.users[userIndex].lastUsedApp = appName;
    return saveUsers(usersData);
}

function saveUserPreferences(userId, preferences) {
    const usersData = loadUsers();
    const userIndex = usersData.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return false;
    }
    
    usersData.users[userIndex].preferences = { ...usersData.users[userIndex].preferences, ...preferences };
    return saveUsers(usersData);
}

function getUserPreferences(userId) {
    const user = getUserById(userId);
    return user ? user.preferences : {};
}

function findUserByUsername(username) {
    const usersData = loadUsers();
    return usersData.users.find(u => u.username === username) || null;
}

function deleteUser(userId) {
    const usersData = loadUsers();
    const userIndex = usersData.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return false;
    }
    
    usersData.users.splice(userIndex, 1);
    return saveUsers(usersData);
}

function createUser(userData) {
    const usersData = loadUsers();
    
    if (usersData.users.find(u => u.username === userData.username)) {
        return null;
    }
    
    const newUser = {
        id: usersData.users.length > 0 ? Math.max(...usersData.users.map(u => u.id)) + 1 : 1,
        username: userData.username,
        password: userData.password,
        role: userData.role || 'operator',
        allowedApps: userData.allowedApps || [],
        networkPaths: userData.networkPaths || {},
        lastUsedApp: null,
        preferences: {}
    };
    
    usersData.users.push(newUser);
    
    if (saveUsers(usersData)) {
        return newUser;
    }
    
    return null;
}

function updateUser(userId, updates) {
    const usersData = loadUsers();
    const userIndex = usersData.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return null;
    }
    
    usersData.users[userIndex] = { ...usersData.users[userIndex], ...updates };
    
    if (saveUsers(usersData)) {
        return usersData.users[userIndex];
    }
    
    return null;
}

module.exports = {
    authenticateUser,
    createUser,
    updateUser,
    getUserById,
    getAllUsers,
    updateUserLastApp,
    saveUserPreferences,
    getUserPreferences,
    loadUsers,
    hashPassword,
    findUserByUsername,
    deleteUser
};
