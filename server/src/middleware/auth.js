const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async(req, res, next) => {
    let token;

    // Check if auth header exists and starts with Bearer
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
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