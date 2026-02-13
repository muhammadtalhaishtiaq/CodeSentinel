const express = require('express');
const auth = require('./auth');
const projects = require('./projects');
const scans = require('./scans');
const dashboard = require('./dashboard');
const integration = require('./integration');

const router = express.Router();

router.use('/auth', auth);
router.use('/projects', projects);
router.use('/scans', scans);
router.use('/api/dashboard', dashboard);
router.use('/integration', integration);

module.exports = router;