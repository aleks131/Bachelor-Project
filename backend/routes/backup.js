const express = require('express');
const router = express.Router();
const backup = require('../utils/backup');
const auth = require('../auth');
const logger = require('../utils/logger');

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

router.post('/create', requireAdmin, (req, res) => {
    try {
        const { type = 'full' } = req.body;
        const result = backup.createBackup(type);
        
        if (result.success) {
            logger.audit('backup_created', req.user, { type, backupName: result.backupName });
            res.json(result);
        } else {
            logger.error('Backup creation failed', null, { type, error: result.error });
            res.status(500).json(result);
        }
    } catch (error) {
        logger.error('Error creating backup', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/list', requireAdmin, (req, res) => {
    try {
        const backups = backup.listBackups();
        res.json({ backups, count: backups.length });
    } catch (error) {
        logger.error('Error listing backups', error);
        res.status(500).json({ error: 'Failed to list backups' });
    }
});

router.post('/restore', requireAdmin, (req, res) => {
    try {
        const { backupName } = req.body;
        
        if (!backupName) {
            return res.status(400).json({ error: 'Backup name is required' });
        }
        
        const result = backup.restoreBackup(backupName);
        
        if (result.success) {
            logger.audit('backup_restored', req.user, { backupName });
            res.json(result);
        } else {
            logger.error('Backup restore failed', null, { backupName, error: result.error });
            res.status(500).json(result);
        }
    } catch (error) {
        logger.error('Error restoring backup', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/:backupName', requireAdmin, (req, res) => {
    try {
        const { backupName } = req.params;
        const result = backup.deleteBackup(backupName);
        
        if (result.success) {
            logger.audit('backup_deleted', req.user, { backupName });
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        logger.error('Error deleting backup', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/cleanup', requireAdmin, (req, res) => {
    try {
        const { keepDays = 30 } = req.body;
        const result = backup.cleanupOldBackups(keepDays);
        
        logger.audit('backup_cleanup', req.user, result);
        res.json(result);
    } catch (error) {
        logger.error('Error cleaning up backups', error);
        res.status(500).json({ error: 'Failed to cleanup backups' });
    }
});

module.exports = router;





