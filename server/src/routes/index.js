const express = require('express');
const auth = require('./auth');
const projects = require('./projects');
const scans = require('./scans');
const dashboard = require('./dashboard');

const router = express.Router();

router.use('/auth', auth);
router.use('/projects', projects);
router.use('/scans', scans);
router.use('/api/dashboard', dashboard);

module.exports = router;