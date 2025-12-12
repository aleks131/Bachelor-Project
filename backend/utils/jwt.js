const jwt = require('jsonwebtoken');
const config = require('../../data/config.json');

const JWT_SECRET = config.server.jwtSecret || config.server.sessionSecret || 'salling-unified-secret-key-change-in-production';
const JWT_EXPIRES_IN = config.server.jwtExpiresIn || '7d';
const JWT_REFRESH_EXPIRES_IN = config.server.jwtRefreshExpiresIn || '30d';

function generateToken(user) {
    const payload = {
        userId: user.id,
        username: user.username,
        role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'salling-unified-app',
        audience: 'salling-unified-app'
    });
}

function generateRefreshToken(user) {
    const payload = {
        userId: user.id,
        type: 'refresh'
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'salling-unified-app',
        audience: 'salling-unified-app'
    });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET, {
            issuer: 'salling-unified-app',
            audience: 'salling-unified-app'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
}

function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
}

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN
};

