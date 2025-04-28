const express = require('express');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    addScanToProject,
    getLatestScan
} = require('../controllers/project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Project routes
router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/:id')
    .get(getProject)
    .put(updateProject)
    .delete(deleteProject);

// Scan-related routes
router.route('/:id/scans')
    .post(addScanToProject);

router.route('/:id/latest-scan')
    .get(getLatestScan);

module.exports = router;