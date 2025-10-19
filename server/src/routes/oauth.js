const express = require('express');
const {
    getOAuthStatus,
    initiateGitHubOAuth,
    handleGitHubCallback,
    initiateAzureOAuth,
    handleAzureCallback,
    initiateBitbucketOAuth,
    handleBitbucketCallback,
    disconnectProvider
} = require('../controllers/oauth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// OAuth status (requires auth)
router.get('/status', protect, getOAuthStatus);

// GitHub OAuth
router.get('/github/connect', protect, initiateGitHubOAuth);
router.get('/github/callback', handleGitHubCallback); // No auth - uses state token

// Azure DevOps OAuth
router.get('/azure/connect', protect, initiateAzureOAuth);
router.get('/azure/callback', handleAzureCallback); // No auth - uses state token

// Bitbucket OAuth
router.get('/bitbucket/connect', protect, initiateBitbucketOAuth);
router.get('/bitbucket/callback', handleBitbucketCallback); // No auth - uses state token

// Disconnect provider
router.delete('/:provider/disconnect', protect, disconnectProvider);

module.exports = router;

