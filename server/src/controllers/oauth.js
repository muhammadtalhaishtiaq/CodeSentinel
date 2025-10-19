const SourceCredential = require('../models/SourceCredential');
const { encrypt, decrypt } = require('../utils/encryption');
const crypto = require('crypto');
const fetch = require('node-fetch');

// GitHub OAuth URLs
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_API_URL = 'https://api.github.com';

/**
 * Generate random state for CSRF protection
 */
const generateState = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * @desc    Initiate GitHub OAuth flow
 * @route   GET /api/oauth/github
 * @access  Private (token can be in header OR query param for popup compatibility)
 */
exports.initiateGitHubOAuth = async (req, res, next) => {
    try {
        console.log('[OAuth] Initiating GitHub OAuth flow...');
        console.log('[OAuth] User from middleware:', req.user ? req.user._id : 'Not set');
        
        // Validate OAuth configuration
        if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
            console.error('[OAuth] GitHub OAuth not configured');
            return res.status(500).json({
                success: false,
                message: 'GitHub OAuth is not configured. Please contact administrator.'
            });
        }

        // User should be attached by middleware
        if (!req.user || !req.user._id) {
            console.error('[OAuth] User not attached to request');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Generate CSRF protection state
        const state = generateState();
        
        // Store state in session for validation (alternatively use Redis)
        req.session = req.session || {};
        req.session.oauthState = state;
        req.session.userId = req.user._id.toString(); // Store user ID for later
        
        console.log('[OAuth] Session state set:', state);
        console.log('[OAuth] User ID stored in session:', req.session.userId);

        // Build GitHub authorization URL
        const authParams = new URLSearchParams({
            client_id: process.env.GITHUB_CLIENT_ID,
            redirect_uri: process.env.GITHUB_CALLBACK_URL,
            scope: 'repo read:user read:org', // Permissions needed
            state: state,
            allow_signup: 'false' // Don't allow signup during OAuth
        });

        const authUrl = `${GITHUB_AUTH_URL}?${authParams.toString()}`;
        
        console.log('[OAuth] Redirecting to GitHub authorization...');
        console.log('[OAuth] Callback URL:', process.env.GITHUB_CALLBACK_URL);
        
        // Redirect user to GitHub
        res.redirect(authUrl);
        
    } catch (error) {
        console.error('[OAuth] Error initiating GitHub OAuth:', error);
        next(error);
    }
};

/**
 * @desc    Handle GitHub OAuth callback
 * @route   GET /api/oauth/github/callback
 * @access  Public (but validates state)
 */
exports.handleGitHubCallback = async (req, res, next) => {
    try {
        const { code, state, error, error_description } = req.query;
        
        console.log('[OAuth] GitHub callback received');
        console.log('[OAuth] Code:', code ? 'Present' : 'Missing');
        console.log('[OAuth] State:', state ? 'Present' : 'Missing');
        console.log('[OAuth] Error:', error || 'None');

        // Handle user rejection or errors from GitHub
        if (error) {
            console.error('[OAuth] GitHub OAuth error:', error, error_description);
            return res.send(`
                <html>
                    <head><title>Authentication Failed</title></head>
                    <body>
                        <script>
                            // Send to opener regardless of port
                            if (window.opener) {
                                window.opener.postMessage({
                                    type: 'oauth-error',
                                    provider: 'github',
                                    error: '${error}',
                                    message: '${error_description || 'Authentication failed'}'
                                }, '*');
                            }
                            setTimeout(() => window.close(), 1000);
                        </script>
                        <p>Authentication failed. This window will close automatically.</p>
                    </body>
                </html>
            `);
        }

        // Validate required parameters
        if (!code || !state) {
            console.error('[OAuth] Missing code or state parameter');
            return res.status(400).send(`
                <html>
                    <head><title>Authentication Error</title></head>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({
                                    type: 'oauth-error',
                                    provider: 'github',
                                    error: 'invalid_request',
                                    message: 'Missing required parameters'
                                }, '*');
                            }
                            setTimeout(() => window.close(), 1000);
                        </script>
                        <p>Invalid request. This window will close automatically.</p>
                    </body>
                </html>
            `);
        }

        // Validate state for CSRF protection
        if (!req.session || !req.session.oauthState || req.session.oauthState !== state) {
            console.error('[OAuth] Invalid state - possible CSRF attack');
            return res.status(403).send(`
                <html>
                    <head><title>Security Error</title></head>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({
                                    type: 'oauth-error',
                                    provider: 'github',
                                    error: 'invalid_state',
                                    message: 'Security validation failed. Please try again.'
                                }, '*');
                            }
                            setTimeout(() => window.close(), 1000);
                        </script>
                        <p>Security validation failed. This window will close automatically.</p>
                    </body>
                </html>
            `);
        }

        const userId = req.session.userId;
        
        if (!userId) {
            console.error('[OAuth] User ID not found in session');
            return res.status(401).send(`
                <html>
                    <head><title>Authentication Error</title></head>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({
                                    type: 'oauth-error',
                                    provider: 'github',
                                    error: 'session_expired',
                                    message: 'Session expired. Please try again.'
                                }, '*');
                            }
                            setTimeout(() => window.close(), 1000);
                        </script>
                        <p>Session expired. This window will close automatically.</p>
                    </body>
                </html>
            `);
        }

        console.log('[OAuth] Exchanging authorization code for access token...');

        // Exchange authorization code for access token
        const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: process.env.GITHUB_CALLBACK_URL
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('[OAuth] Token exchange failed:', tokenResponse.status, errorText);
            throw new Error('Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            console.error('[OAuth] Token exchange error:', tokenData.error_description);
            throw new Error(tokenData.error_description || 'Token exchange failed');
        }

        const { access_token, refresh_token, expires_in, token_type } = tokenData;

        if (!access_token) {
            console.error('[OAuth] No access token received');
            throw new Error('No access token received from GitHub');
        }

        console.log('[OAuth] Access token received successfully');
        console.log('[OAuth] Token type:', token_type);
        console.log('[OAuth] Expires in:', expires_in || 'Never (classic token)');

        // Fetch user information from GitHub
        console.log('[OAuth] Fetching user information from GitHub...');
        const userResponse = await fetch(`${GITHUB_API_URL}/user`, {
            headers: {
                'Authorization': `${token_type || 'token'} ${access_token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error('[OAuth] Failed to fetch user info:', userResponse.status, errorText);
            throw new Error('Failed to fetch user information from GitHub');
        }

        const githubUser = await userResponse.json();
        
        console.log('[OAuth] GitHub user info received:', {
            id: githubUser.id,
            login: githubUser.login,
            email: githubUser.email
        });

        // Encrypt access token before storing
        console.log('[OAuth] Encrypting access token...');
        const encryptedToken = encrypt(access_token);
        const encryptedRefreshToken = refresh_token ? encrypt(refresh_token) : null;

        // Calculate token expiry (GitHub classic tokens don't expire)
        const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;

        // Save or update credentials in database
        console.log('[OAuth] Saving credentials to database...');
        
        let credential = await SourceCredential.findOne({
            user: userId,
            provider: 'github'
        });

        if (credential) {
            // Update existing credential
            console.log('[OAuth] Updating existing GitHub credentials');
            credential.authType = 'oauth';
            credential.githubToken = encryptedToken;
            credential.githubRefreshToken = encryptedRefreshToken;
            credential.githubTokenExpiresAt = expiresAt;
            credential.providerUserId = githubUser.id.toString();
            credential.providerUsername = githubUser.login;
            credential.providerEmail = githubUser.email;
            credential.isActive = true;
            credential.updatedAt = Date.now();
            
            await credential.save();
        } else {
            // Create new credential
            console.log('[OAuth] Creating new GitHub credentials');
            credential = await SourceCredential.create({
                user: userId,
                provider: 'github',
                authType: 'oauth',
                githubToken: encryptedToken,
                githubRefreshToken: encryptedRefreshToken,
                githubTokenExpiresAt: expiresAt,
                providerUserId: githubUser.id.toString(),
                providerUsername: githubUser.login,
                providerEmail: githubUser.email,
                isActive: true,
                isDefault: false
            });
        }

        console.log('[OAuth] Credentials saved successfully');
        console.log('[OAuth] Credential ID:', credential._id);

        // Clear session state
        delete req.session.oauthState;
        delete req.session.userId;

        // Send success response with popup closer
        res.send(`
            <html>
                <head>
                    <title>Authentication Successful</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                        }
                        .success-box {
                            background: white;
                            color: #333;
                            padding: 40px;
                            border-radius: 10px;
                            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                            text-align: center;
                            max-width: 400px;
                        }
                        .checkmark {
                            font-size: 64px;
                            color: #10b981;
                            margin-bottom: 20px;
                        }
                        h1 { margin: 0 0 10px; font-size: 24px; }
                        p { color: #666; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="success-box">
                        <div class="checkmark">✓</div>
                        <h1>Connected Successfully!</h1>
                        <p>Your GitHub account has been connected to CodeSentinel.</p>
                        <p style="font-size: 12px; color: #999; margin-top: 20px;">This window will close automatically...</p>
                    </div>
                    <script>
                        // Send success message to parent window (works with any dev port)
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'oauth-success',
                                provider: 'github',
                                username: '${githubUser.login}',
                                email: '${githubUser.email || ''}'
                            }, '*'); // Allow any origin in dev (frontend validates sender)
                        }
                        
                        // Close window after 2 seconds
                        setTimeout(() => {
                            window.close();
                        }, 2000);
                    </script>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('[OAuth] Error in GitHub callback:', error);
        
        // Send error message to popup opener
        res.status(500).send(`
            <html>
                <head><title>Authentication Error</title></head>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'oauth-error',
                                provider: 'github',
                                error: 'server_error',
                                message: '${error.message || 'An unexpected error occurred'}'
                            }, '*');
                        }
                        setTimeout(() => window.close(), 1000);
                    </script>
                    <p>An error occurred. This window will close automatically.</p>
                </body>
            </html>
        `);
    }
};

/**
 * @desc    Get decrypted GitHub token for API use
 * @param   {string} userId - User ID
 * @returns {Promise<string|null>} Decrypted access token
 */
exports.getGitHubToken = async (userId) => {
    try {
        const credential = await SourceCredential.findOne({
            user: userId,
            provider: 'github',
            isActive: true
        });

        if (!credential || !credential.githubToken) {
            return null;
        }

        // Check if token is expired (for OAuth tokens)
        if (credential.githubTokenExpiresAt && credential.githubTokenExpiresAt < new Date()) {
            console.warn('[OAuth] GitHub token expired for user:', userId);
            // TODO: Implement token refresh logic here
            return null;
        }

        // Decrypt and return token
        return decrypt(credential.githubToken);
        
    } catch (error) {
        console.error('[OAuth] Error getting GitHub token:', error);
        return null;
    }
};

/**
 * @desc    Disconnect GitHub account
 * @route   DELETE /api/oauth/github/disconnect
 * @access  Private
 */
exports.disconnectGitHub = async (req, res, next) => {
    try {
        console.log('[OAuth] Disconnecting GitHub for user:', req.user._id);

        const credential = await SourceCredential.findOne({
            user: req.user._id,
            provider: 'github'
        });

        if (!credential) {
            return res.status(404).json({
                success: false,
                message: 'No GitHub account connected'
            });
        }

        // Delete the credential
        await credential.deleteOne();

        console.log('[OAuth] GitHub disconnected successfully');

        res.status(200).json({
            success: true,
            message: 'GitHub account disconnected successfully'
        });

    } catch (error) {
        console.error('[OAuth] Error disconnecting GitHub:', error);
        next(error);
    }
};

module.exports = exports;


