const fetch = require('node-fetch');
const crypto = require('crypto');
const config = require('../config/config');
const SourceCredential = require('../models/SourceCredential');
const { encrypt, decrypt } = require('../utils/encryption');

/**
 * Generate random state for CSRF protection
 */
const generateState = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * OAuth Provider URLs
 */
const OAUTH_PROVIDERS = {
    github: {
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userUrl: 'https://api.github.com/user',
        scope: 'repo user:email read:org'
    },
    bitbucket: {
        authUrl: 'https://bitbucket.org/site/oauth2/authorize',
        tokenUrl: 'https://bitbucket.org/site/oauth2/access_token',
        userUrl: 'https://api.bitbucket.org/2.0/user',
        scope: 'account repository pullrequest'
    },
    azure: {
        authUrl: (tenantId) => `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
        tokenUrl: (tenantId) => `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        userUrl: 'https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=6.0',
        scope: 'vso.code vso.project vso.build'
    }
};

/**
 * @desc    Initiate OAuth flow for any provider
 * @route   GET /api/oauth/:provider
 * @access  Private
 */
exports.initiateOAuth = async (req, res, next) => {
    try {
        const { provider } = req.params;
        console.log(`[OAuth] Initiating ${provider} OAuth flow...`);

        // Validate provider
        if (!['github', 'bitbucket', 'azure'].includes(provider)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid provider'
            });
        }

        // Check if OAuth is configured for this provider
        const providerConfig = config.oauth[provider];
        if (!providerConfig || !providerConfig.clientId || !providerConfig.clientSecret) {
            console.error(`[OAuth] ${provider} OAuth not configured`);
            return res.status(500).json({
                success: false,
                message: `${provider} OAuth is not configured. Please contact administrator.`
            });
        }

        // User should be authenticated
        if (!req.user || !req.user._id) {
            console.error('[OAuth] User not authenticated');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Generate CSRF state
        const state = generateState();
        
        // Store state in session
        req.session = req.session || {};
        req.session.oauthState = state;
        req.session.userId = req.user._id.toString();
        req.session.provider = provider;
        
        console.log(`[OAuth] Session state set for ${provider}:`, state);

        // Build authorization URL based on provider
        let authUrl;
        const baseAuthUrl = provider === 'azure' 
            ? OAUTH_PROVIDERS.azure.authUrl(providerConfig.tenantId)
            : OAUTH_PROVIDERS[provider].authUrl;

        if (provider === 'azure') {
            const authParams = new URLSearchParams({
                client_id: providerConfig.clientId,
                response_type: 'code',
                redirect_uri: providerConfig.callbackUrl,
                response_mode: 'query',
                scope: OAUTH_PROVIDERS.azure.scope,
                state: state
            });
            authUrl = `${baseAuthUrl}?${authParams.toString()}`;
        } else {
            const authParams = new URLSearchParams({
                client_id: providerConfig.clientId,
                redirect_uri: providerConfig.callbackUrl,
                scope: OAUTH_PROVIDERS[provider].scope,
                state: state
            });
            authUrl = `${baseAuthUrl}?${authParams.toString()}`;
        }

        console.log(`[OAuth] Redirecting to ${provider} authorization...`);
        res.redirect(authUrl);
        
    } catch (error) {
        console.error(`[OAuth] Error initiating OAuth:`, error);
        next(error);
    }
};

/**
 * @desc    Handle OAuth callback for any provider
 * @route   GET /api/oauth/:provider/callback
 * @access  Public (validates state)
 */
exports.handleOAuthCallback = async (req, res, next) => {
    try {
        const { provider } = req.params;
        const { code, state, error, error_description } = req.query;
        
        console.log(`[OAuth] ${provider} callback received`);
        console.log(`[OAuth] Code: ${code ? 'Present' : 'Missing'}`);
        console.log(`[OAuth] State: ${state ? 'Present' : 'Missing'}`);

        // Handle errors from provider
        if (error) {
            console.error(`[OAuth] ${provider} OAuth error:`, error, error_description);
            return sendErrorResponse(res, provider, error, error_description || 'Authentication failed');
        }

        // Validate required parameters
        if (!code || !state) {
            console.error(`[OAuth] Missing code or state`);
            return sendErrorResponse(res, provider, 'invalid_request', 'Missing required parameters');
        }

        // Validate state (CSRF protection)
        if (!req.session || !req.session.oauthState || req.session.oauthState !== state) {
            console.error(`[OAuth] Invalid state - possible CSRF attack`);
            return sendErrorResponse(res, provider, 'invalid_state', 'Security validation failed');
        }

        const userId = req.session.userId;
        if (!userId) {
            console.error(`[OAuth] User ID not found in session`);
            return sendErrorResponse(res, provider, 'session_expired', 'Session expired');
        }

        console.log(`[OAuth] Exchanging authorization code for access token...`);

        // Exchange code for token (provider-specific)
        const tokenData = await exchangeCodeForToken(provider, code);
        
        if (tokenData.error) {
            console.error(`[OAuth] Error exchanging code:`, tokenData.error);
            return sendErrorResponse(res, provider, tokenData.error, 'Failed to get access token');
        }

        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        const expiresIn = tokenData.expires_in;

        // Fetch user information from provider
        console.log(`[OAuth] Fetching user information from ${provider}...`);
        const userData = await fetchUserData(provider, accessToken);

        if (!userData) {
            console.error(`[OAuth] Failed to fetch user data`);
            return sendErrorResponse(res, provider, 'user_fetch_failed', 'Failed to fetch user information');
        }

        console.log(`[OAuth] User info received:`, {
            id: userData.id,
            username: userData.username,
            email: userData.email
        });

        // Encrypt tokens
        console.log(`[OAuth] Encrypting access token...`);
        const encryptedToken = encrypt(accessToken);
        const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

        // Save or update credentials
        console.log(`[OAuth] Saving credentials to database...`);
        const credentialData = {
            user: userId,
            provider,
            authType: 'oauth',
            providerUserId: userData.id,
            providerUsername: userData.username,
            providerEmail: userData.email || null,
            isActive: true,
            isDefault: true
        };

        // Add provider-specific token fields
        if (provider === 'github') {
            credentialData.githubToken = encryptedToken;
            credentialData.githubRefreshToken = encryptedRefreshToken;
            credentialData.githubTokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
        } else if (provider === 'bitbucket') {
            credentialData.bitbucketToken = encryptedToken;
            credentialData.bitbucketRefreshToken = encryptedRefreshToken;
        } else if (provider === 'azure') {
            credentialData.azureToken = encryptedToken;
            credentialData.azureRefreshToken = encryptedRefreshToken;
            credentialData.azureTokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
        }

        const credential = await SourceCredential.findOneAndUpdate(
            { user: userId, provider, authType: 'oauth' },
            credentialData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        console.log(`[OAuth] Credentials saved successfully`);

        // Clear session state
        delete req.session.oauthState;
        delete req.session.userId;
        delete req.session.provider;

        // Send success response
        return sendSuccessResponse(res, provider, userData.username, userData.email);
        
    } catch (error) {
        console.error(`[OAuth] Error in callback:`, error);
        const { provider } = req.params;
        return sendErrorResponse(res, provider, 'server_error', error.message || 'An unexpected error occurred');
    }
};

/**
 * @desc    Disconnect OAuth account
 * @route   DELETE /api/oauth/:provider/disconnect
 * @access  Private
 */
exports.disconnectOAuth = async (req, res, next) => {
    try {
        const { provider } = req.params;
        const userId = req.user._id;

        console.log(`[OAuth] Disconnecting ${provider} for user ${userId}`);

        const result = await SourceCredential.deleteOne({
            user: userId,
            provider,
            authType: 'oauth'
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: `${provider} OAuth connection not found.`
            });
        }

        res.status(200).json({
            success: true,
            message: `${provider} OAuth connection disconnected successfully.`
        });

    } catch (error) {
        console.error(`[OAuth] Error disconnecting:`, error);
        next(error);
    }
};

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(provider, code) {
    const providerConfig = config.oauth[provider];
    let tokenUrl, requestBody, headers;

    if (provider === 'github') {
        tokenUrl = OAUTH_PROVIDERS.github.tokenUrl;
        requestBody = JSON.stringify({
            client_id: providerConfig.clientId,
            client_secret: providerConfig.clientSecret,
            code,
            redirect_uri: providerConfig.callbackUrl
        });
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    } else if (provider === 'bitbucket') {
        tokenUrl = OAUTH_PROVIDERS.bitbucket.tokenUrl;
        // Bitbucket uses form data
        const formData = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: providerConfig.callbackUrl
        });
        requestBody = formData;
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${providerConfig.clientId}:${providerConfig.clientSecret}`).toString('base64')}`
        };
    } else if (provider === 'azure') {
        tokenUrl = OAUTH_PROVIDERS.azure.tokenUrl(providerConfig.tenantId);
        const formData = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: providerConfig.clientId,
            client_secret: providerConfig.clientSecret,
            code,
            redirect_uri: providerConfig.callbackUrl,
            scope: OAUTH_PROVIDERS.azure.scope
        });
        requestBody = formData;
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
    }

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers,
        body: requestBody
    });

    return await response.json();
}

/**
 * Fetch user data from provider
 */
async function fetchUserData(provider, accessToken) {
    let userUrl, headers, response, data;

    if (provider === 'github') {
        userUrl = OAUTH_PROVIDERS.github.userUrl;
        headers = {
            'Authorization': `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'CodeSentinel-App'
        };
        response = await fetch(userUrl, { headers });
        data = await response.json();
        return {
            id: data.id?.toString(),
            username: data.login,
            email: data.email
        };
    } else if (provider === 'bitbucket') {
        userUrl = OAUTH_PROVIDERS.bitbucket.userUrl;
        headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        };
        response = await fetch(userUrl, { headers });
        data = await response.json();
        return {
            id: data.uuid,
            username: data.username,
            email: data.email
        };
    } else if (provider === 'azure') {
        userUrl = OAUTH_PROVIDERS.azure.userUrl;
        headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        };
        response = await fetch(userUrl, { headers });
        data = await response.json();
        return {
            id: data.id,
            username: data.displayName || data.emailAddress?.split('@')[0],
            email: data.emailAddress
        };
    }

    return null;
}

/**
 * Send success HTML response with postMessage
 */
function sendSuccessResponse(res, provider, username, email) {
    res.send(`
        <html>
            <head>
                <title>Authentication Success</title>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .success-box { background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); padding: 40px; text-align: center; max-width: 400px; width: 90%; }
                    .checkmark { font-size: 60px; color: #28a745; line-height: 1; margin-bottom: 20px; }
                    h1 { color: #333; font-size: 24px; margin-bottom: 10px; }
                    p { color: #666; font-size: 16px; line-height: 1.5; }
                </style>
            </head>
            <body>
                <div class="success-box">
                    <div class="checkmark">✓</div>
                    <h1>Connected Successfully!</h1>
                    <p>Your ${provider} account has been connected to CodeSentinel.</p>
                    <p style="font-size: 12px; color: #999; margin-top: 20px;">This window will close automatically...</p>
                </div>
                <script>
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'oauth-success',
                            provider: '${provider}',
                            username: '${username || ''}',
                            email: '${email || ''}'
                        }, '*');
                    }
                    setTimeout(() => window.close(), 2000);
                </script>
            </body>
        </html>
    `);
}

/**
 * Send error HTML response with postMessage
 */
function sendErrorResponse(res, provider, error, message) {
    res.send(`
        <html>
            <head><title>Authentication Failed</title></head>
            <body>
                <script>
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'oauth-error',
                            provider: '${provider}',
                            error: '${error}',
                            message: '${message}'
                        }, '*');
                    }
                    setTimeout(() => window.close(), 1000);
                </script>
                <p>Authentication failed. This window will close automatically.</p>
            </body>
        </html>
    `);
}


