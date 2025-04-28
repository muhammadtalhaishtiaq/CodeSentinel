const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const sendEmail = require('../utils/emailUtils');
const crypto = require('crypto');
const mongoose = require('mongoose');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async(req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        });

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async(req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email and select password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async(req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async(req, res, next) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'There is no user with that email'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        // Save user with reset token and expiry
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        // Create message
        const message = `
      <h1>Password Reset</h1>
      <p>You requested a password reset</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message
            });

            res.status(200).json({
                success: true,
                message: 'Email sent'
            });
        } catch (err) {
            // Clear reset token fields if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent'
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async(req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        // Find user by reset token and check if expired
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async(req, res, next) => {
    try {
        console.log('Update profile request received for user ID:', req.user._id);
        const { firstName, lastName, currentPassword, newPassword } = req.body;
        console.log('Update fields:', { firstName, lastName, hasCurrentPassword: !!currentPassword, hasNewPassword: !!newPassword });

        // For additional security, re-fetch the user with password
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            console.error('User not found in updateProfile:', req.user._id);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('User found for update:', user.email);
        console.log('User has updateAndHashPassword method:', typeof user.updateAndHashPassword === 'function');

        // Update basic fields
        user.firstName = firstName;
        user.lastName = lastName;

        // Handle password update separately
        let passwordUpdated = false;

        // Check if password update is requested
        if (currentPassword && newPassword) {
            console.log('Password update requested');

            // Verify current password
            try {
                console.log('Verifying current password');
                const isMatch = await user.matchPassword(currentPassword);
                console.log('Password match result:', isMatch);

                if (!isMatch) {
                    return res.status(401).json({
                        success: false,
                        message: 'Current password is incorrect'
                    });
                }

                // We'll save name fields first, then handle password separately
                passwordUpdated = true;
            } catch (error) {
                console.error('Password verification error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error verifying password'
                });
            }
        }

        // Save the basic user info first
        console.log('Saving updated user info (without password changes)');
        await user.save();

        // Now handle password update if needed
        if (passwordUpdated) {
            try {
                console.log('Now updating password separately');
                // Manual fallback if method is missing
                if (typeof user.updateAndHashPassword !== 'function') {
                    console.log('updateAndHashPassword method not found, using direct approach');
                    user.password = newPassword;
                    user.markModified('password');
                    await user.save();
                } else {
                    // Use our special method to ensure the password is marked as modified
                    await user.updateAndHashPassword(newPassword);
                }
                console.log('Password updated and hashed');
            } catch (error) {
                console.error('Error updating password:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update password'
                });
            }
        }

        // IMPORTANT: Never return the password in the response
        res.status(200).json({
            success: true,
            message: passwordUpdated ? 'Profile and password updated successfully' : 'Profile updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Profile update error:', error.message);
        console.error(error.stack);
        next(error);
    }
};

// @desc    Test password verification
// @route   POST /api/auth/verify-password
// @access  Private
exports.verifyPassword = async(req, res, next) => {
    try {
        const { password } = req.body;

        // Find user by id and select password
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        res.status(200).json({
            success: true,
            passwordCorrect: isMatch,
            message: isMatch ? 'Password is correct' : 'Password is incorrect'
        });
    } catch (error) {
        console.error('Password verification test error:', error);
        next(error);
    }
};