const express = require('express');
const {
    uploadAndScan,
    getScanStatus
} = require('../controllers/scan');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Scan routes
router.route('/upload')
    .post(uploadAndScan);

router.route('/:id')
    .get(getScanStatus);

router.get('/:scanId/status', getScanStatus);

module.exports = router;