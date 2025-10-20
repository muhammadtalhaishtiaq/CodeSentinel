const express = require('express');
const {
    getSourceCredentials,
    getSourceCredentialById,
    addSourceCredential,
    updateDefaultProvider,
    testConnection,
    getRepositories,
    toggleRepository,
    deleteRepository,
    syncRepositories
} = require('../controllers/integration');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Source credentials routes
router.route('/credentials')
    .get(getSourceCredentials)
    .post(addSourceCredential);

router.route('/credentials/:id')
    .get(getSourceCredentialById);

// Default provider route
router.patch('/default-provider', updateDefaultProvider);

// Test connection route
router.post('/test-connection', testConnection);

// Repository routes
router.route('/repositories')
    .get(getRepositories);

router.route('/repositories/:id/toggle')
    .patch(toggleRepository);

router.route('/repositories/:id')
    .delete(deleteRepository);

// Sync repositories route
router.post('/sync-repositories', syncRepositories);

module.exports = router;