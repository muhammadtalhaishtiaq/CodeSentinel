const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getRecentProjects
} = require('../controllers/projects');
const {
    getChatHistory,
    sendMessage
} = require('../controllers/chat');

// Project routes
router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

router.route('/recent')
    .get(protect, getRecentProjects);

router.route('/:id')
    .get(protect, getProject)
    .put(protect, updateProject)
    .delete(protect, deleteProject);

// Chat routes
router.route('/:projectId/chats')
    .get(protect, getChatHistory)
    .post(protect, sendMessage);

module.exports = router;