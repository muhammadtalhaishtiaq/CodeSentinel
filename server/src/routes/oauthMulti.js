const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
    initiateOAuth,
    handleOAuthCallback,
    disconnectOAuth
} = require('../controllers/oauthMulti');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Custom middleware to handle token from query param (for popup compatibility)
const protectWithQueryToken = async (req, res, next) => {
    let token;

    // Check Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('[OAuth Auth] Token from Authorization header');
    }
    // Then check query parameter (for popup window)
    else if (req.query.token) {
        token = req.query.token;
        console.log('[OAuth Auth] Token from query parameter');
    }
    // Then check cookies
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log('[OAuth Auth] Token from cookies');
    }

    if (!token) {
        console.error('[OAuth Auth] No token found');
        return res.status(401).json({
            success: false,
            message: 'Authentication token is missing. Please log in again.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[OAuth Auth] Token verified for user:', decoded.id);

        // Find user
        const user = await User.findById(decoded.id);

        if (!user) {
            console.error('[OAuth Auth] User not found:', decoded.id);
            return res.status(401).json({
                success: false,
                message: 'User not found. Please log in again.'
            });
        }

        // Attach user to request
        req.user = user;
        console.log('[OAuth Auth] User authenticated:', user.email);
        next();

    } catch (err) {
        console.error('[OAuth Auth] Token verification failed:', err.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        });
    }
};

// OAuth Routes (supports GitHub, Bitbucket, Azure)
router.get('/:provider', protectWithQueryToken, initiateOAuth);
router.get('/:provider/callback', handleOAuthCallback); // No protect - validates state instead
router.delete('/:provider/disconnect', protect, disconnectOAuth);

module.exports = router;


