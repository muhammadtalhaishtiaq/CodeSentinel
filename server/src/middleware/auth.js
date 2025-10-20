const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async(req, res, next) => {
    let token;

    // Debug request headers
    console.log('Auth headers:', req.headers.authorization);

    // Check if auth header exists and starts with Bearer
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
        console.log('Token extracted from Authorization header');
    } else if (req.query.token) {
        // Set token from query parameter (for OAuth popups)
        token = req.query.token;
        console.log('Token extracted from query parameter');
    } else if (req.cookies && req.cookies.token) {
        // Set token from cookie
        token = req.cookies.token;
        console.log('Token extracted from cookies');
    }

    // Make sure token exists
    if (!token) {
        console.error('No authentication token provided');
        return res.status(401).json({
            success: false,
            message: 'Authentication token is missing. Please log in again.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully for user ID:', decoded.id);

        // Find user by id from decoded token
        const user = await User.findById(decoded.id);

        if (!user) {
            console.error('User not found for ID:', decoded.id);
            return res.status(401).json({
                success: false,
                message: 'User not found. Please log in again.'
            });
        }

        // Attach user to request object
        req.user = user;
        console.log('User attached to request:', user.email);

        next();
    } catch (err) {
        console.error('Authentication error:', err.message);

        // Provide more specific error messages
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please log in again.'
            });
        }

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please log in again.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Authentication failed. Please log in again.'
        });
    }
};