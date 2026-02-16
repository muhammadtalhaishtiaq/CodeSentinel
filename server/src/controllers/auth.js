const User = require('../models/User');
const ScanRule = require('../models/ScanRule');
const { generateToken } = require('../utils/jwtUtils');
const sendEmail = require('../utils/emailUtils');
const getResetPasswordEmailTemplate = require('../templates/resetPasswordEmail');
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

        // Create master rule for new user (comprehensive evaluation)
        const masterRuleContent = `COMPREHENSIVE CODE EVALUATION - 22 Point Assessment

Evaluate code against the following 9 categories covering all aspects of quality, security, and best practices:

CATEGORY 1: CODE QUALITY (3 points)
- Naming conventions followed (variables, functions, classes have clear, descriptive names)
- Modular structure (code is well-organized, DRY principle followed, proper separation of concerns)
- No dead code (no unused variables, functions, imports, or commented-out code blocks)

CATEGORY 2: FUNCTIONALITY (3 points)
- Requirements met (code implements business logic correctly and completely)
- Error handling present (exceptions caught properly, edge cases handled gracefully)
- Edge cases covered (null checks, boundary conditions, failure scenarios considered)

CATEGORY 3: SECURITY (3 points)
- No hardcoded secrets (no passwords, API keys, tokens, credentials in source code)
- Input validation (all user inputs sanitized, SQL injection prevention, XSS prevention)
- Authentication and Authorization (proper access control, permission checks implemented)

CATEGORY 4: PERFORMANCE (3 points)
- Optimized logic (no unnecessary loops, efficient algorithms, minimal complexity)
- Caching strategies (Redis, in-memory cache, browser cache where applicable)
- Database queries optimized (no N+1 queries, proper indexing, efficient joins, eager loading)

CATEGORY 5: TESTING (2 points)
- Unit and Integration tests written (positive cases, negative cases, edge cases)
- Test coverage adequate (critical paths tested, proper use of mocks and stubs)

CATEGORY 6: CODING STANDARDS (2 points)
- Language standards followed (consistent formatting, idiomatic code for the language)
- Static analysis passes (no linting errors, proper type hints, clean code metrics)

CATEGORY 7: DEPENDENCIES (2 points)
- No outdated packages (dependencies are current or recent versions)
- Security vulnerabilities absent (no known CVEs in dependencies, secure packages)

CATEGORY 8: DOCUMENTATION (2 points)
- Code documented (meaningful comments, complex logic explained clearly)
- API and README updated (changes reflected in documentation, clear usage examples)

CATEGORY 9: UI/UX (2 points)
- Design compliance (matches specifications, responsive design, mobile-friendly)
- User experience optimized (intuitive interface, accessible, no breaking changes)

SEVERITY LEVELS:
CRITICAL (0-11 points): Major security vulnerabilities, data exposure risks, critical bugs
HIGH (12-15 points): Performance bottlenecks, missing error handling, architectural issues
MEDIUM (16-19 points): Code quality issues, incomplete tests, documentation gaps
LOW (20-22 points): Minor improvements, small optimizations, style consistency

PATTERNS TO CHECK FOR:
Security: hardcoded credentials, password, secret, api_key, token, private_key, access_token
Queries: query in loop, N+1 problem, missing indexes, inefficient joins
Quality: unused imports, dead code, commented code, console.log, print statements
Testing: missing tests, no error handling, unhandled exceptions
Validation: missing input validation, no sanitization, XSS vulnerabilities, SQL injection risks
`;
        
        try {
            await ScanRule.create({
                user: user._id,
                name: 'Comprehensive Code Evaluation',
                description: 'Complete evaluation of code quality, security, performance, testing, standards, dependencies, documentation, and UX across all programming languages',
                severity: 'critical',
                languages: ['javascript', 'typescript', 'python', 'php', 'java', 'csharp', 'cpp', 'go', 'rust', 'ruby', 'sql', 'html', 'css', 'kotlin', 'swift'],
                checkFor: ['security', 'quality', 'performance', 'testing', 'standards', 'dependencies', 'documentation', 'ux'],
                ruleDetails: masterRuleContent,
                category: 'security',
                active: true,
                isDefault: false,
                ruleType: 'master',
                isMasterRule: true,
                // examples: {
                //     badCode: 'password = "admin123"\nfor user in users:\n    posts = db.query("SELECT * FROM posts WHERE user_id = " + user.id)',
                //     goodCode: 'password = os.environ.get("DB_PASSWORD")\nusers_with_posts = db.query("SELECT * FROM users LEFT JOIN posts ON users.id = posts.user_id")'
                // }
            });
        } catch (ruleError) {
            console.error('Error creating master rule:', ruleError);
            // Continue even if master rule creation fails
        }

        // Create shared AIML config for new user (required for PR scanning and tracking)
        try {
            const LLMConfig = require('../models/LLMConfig');
            await LLMConfig.create({
                userId: user._id,
                provider: 'aiml',
                displayName: 'AIML (Shared)',
                isDefault: true,
                isActive: true
                // No API key needed - uses environment shared key
            });
            console.log(`[INFO] Created shared AIML config for user ${user._id}`);
        } catch (llmError) {
            console.error('Error creating shared AIML config:', llmError);
            // Continue even if LLM config creation fails
        }

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
    console.log('Forgot password request received');
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
        const resetUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;
        
        // Create professional HTML email
        const htmlEmail = getResetPasswordEmailTemplate(resetUrl, user.name);

        console.log(`Password reset link for ${email}: ${resetUrl}`); // Log the reset URL for testing purposes
        console.log(`Reset email content:\n${htmlEmail}`); // Log the email content for testing purposes

        try { 
            await sendEmail({
                email: user.email,
                subject: 'Reset Your CodeSentinel Password',
                message: `Reset your password by visiting: ${resetUrl}`,
                html: htmlEmail
            });

            res.status(200).json({
                success: true,
                message: 'Password reset link generated (check console in development mode)'
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
        const { firstName, lastName, currentPassword, newPassword } = req.body;

        // For additional security, re-fetch the user with password
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            console.error('User not found in updateProfile:', req.user._id);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update basic fields
        user.firstName = firstName;
        user.lastName = lastName;

        // Handle password update separately
        let passwordUpdated = false;

        // Check if password update is requested
        if (currentPassword && newPassword) {

            // Verify current password
            try {
                const isMatch = await user.matchPassword(currentPassword);

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
        await user.save();

        // Now handle password update if needed
        if (passwordUpdated) {
            try {
                // Manual fallback if method is missing
                if (typeof user.updateAndHashPassword !== 'function') {
                    user.password = newPassword;
                    user.markModified('password');
                    await user.save();
                } else {
                    // Use our special method to ensure the password is marked as modified
                    await user.updateAndHashPassword(newPassword);
                }
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

// @desc    Validate reset token
// @route   GET /api/auth/validate-reset-token/:resettoken
// @access  Public
exports.validateResetToken = async(req, res, next) => {
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
                message: 'Invalid or expired reset token'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Valid reset token'
        });
    } catch (error) {
        next(error);
    }
};