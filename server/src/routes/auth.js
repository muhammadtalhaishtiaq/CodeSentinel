const express = require('express');
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateProfile,
    verifyPassword,
    validateResetToken
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.get('/validate-reset-token/:resettoken', validateResetToken);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/update-profile', protect, updateProfile);
router.post('/verify-password', protect, verifyPassword);

module.exports = router;