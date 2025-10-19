const express = require('express');
const { getRepositoryRefs } = require('../controllers/repository');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get branches and pull requests for a repository
router.get('/:repoId/refs', protect, getRepositoryRefs);

module.exports = router;

