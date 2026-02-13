const express = require('express');
const {
    uploadAndScan,
    getScanStatus,
    getScanProgress
} = require('../controllers/scan');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Scan routes
router.route('/upload')
    .post(uploadAndScan);

// Start a scan (also available at /api/projects/:id/start-scan)
router.post('/start', require('../controllers/scan').startScan);

// SSE endpoint for real-time scan progress
router.get('/:scanId/progress', getScanProgress);

// Scan status
router.get('/:scanId/status', getScanStatus);

module.exports = router;