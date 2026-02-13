const SourceCredential = require('../models/SourceCredential');
const axios = require('axios');
const config = require('../config/config');

// Helper function to get the appropriate access token
const getAccessToken = (credential) => {
    // Prefer OAuth token, fallback to legacy token
    if (credential.accessToken) {
        return credential.accessToken;
    }
    if (credential.provider === 'github' && credential.githubToken) {
        return credential.githubToken;
    }
    if (credential.provider === 'bitbucket' && credential.bitbucketToken) {
        return credential.bitbucketToken;
    }
    return null;
};

// @desc    Get OAuth connection status for all providers
// @route   GET /api/oauth/status
// @access  Private
exports.getOAuthStatus = async (req, res, next) => {
    try {
        const credentials = await SourceCredential.find({ 
            user: req.user._id,
            isActive: true 
        }).select('-accessToken -refreshToken -githubToken -bitbucketToken');

        const status = {
            github: null,
            azure: null,
            bitbucket: null
        };

        credentials.forEach(cred => {
            status[cred.provider] = {
                connected: true,
                username: cred.providerUsername,
                email: cred.providerEmail,
                connectedAt: cred.createdAt,
                isDefault: cred.isDefault
            };
        });

        res.status(200).json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Error fetching OAuth status:', error);
        next(error);
    }
};

// @desc    Initiate GitHub OAuth flow
// @route   GET /api/oauth/github/connect
// @access  Private
exports.initiateGitHubOAuth = async (req, res, next) => {
    try {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const redirectUri = process.env.GITHUB_CALLBACK_URL;
        const state = Buffer.from(JSON.stringify({ userId: req.user._id })).toString('base64');

        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user:email&state=${state}`;

        res.status(200).json({
            success: true,
            data: { authUrl: githubAuthUrl }
        });
    } catch (error) {
        console.error('Error initiating GitHub OAuth:', error);
        next(error);
    }
};

// @desc    Handle GitHub OAuth callback
// @route   GET /api/oauth/github/callback
// @access  Public (but uses state token)
exports.handleGitHubCallback = async (req, res, next) => {
    try {
        const { code, state } = req.query;

        if (!code) {
            return res.send(`
                <html>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({ type: 'oauth-error', provider: 'github', error: 'no_code' }, '${process.env.FRONTEND_URL}');
                                window.close();
                            } else {
                                window.location.href = '${process.env.FRONTEND_URL}/api-integrations?error=no_code';
                            }
                        </script>
                        <p>Error occurred. Closing...</p>
                    </body>
                </html>
            `);
        }

        // Decode state to get userId
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
        const userId = decodedState.userId;

        // Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: process.env.GITHUB_CALLBACK_URL
        }, {
            headers: { Accept: 'application/json' }
        });

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            return res.send(`
                <html>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({ type: 'oauth-error', provider: 'github', error: 'no_token' }, '${process.env.FRONTEND_URL}');
                                window.close();
                            } else {
                                window.location.href = '${process.env.FRONTEND_URL}/api-integrations?error=no_token';
                            }
                        </script>
                        <p>Error occurred. Closing...</p>
                    </body>
                </html>
            `);
        }

        // Fetch user info from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const githubUser = userResponse.data;

        // Save or update credentials
        let credential = await SourceCredential.findOne({
            user: userId,
            provider: 'github'
        });

        if (credential) {
            credential.accessToken = accessToken;
            credential.providerUserId = githubUser.id.toString();
            credential.providerUsername = githubUser.login;
            credential.providerEmail = githubUser.email;
            credential.isActive = true;
            await credential.save();
        } else {
            credential = await SourceCredential.create({
                user: userId,
                provider: 'github',
                accessToken,
                providerUserId: githubUser.id.toString(),
                providerUsername: githubUser.login,
                providerEmail: githubUser.email,
                isActive: true,
                isDefault: true // First provider is default
            });
        }

        // Send HTML that closes popup and notifies parent
        res.send(`
            <html>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({ type: 'oauth-success', provider: 'github' }, '${process.env.FRONTEND_URL}');
                            window.close();
                        } else {
                            window.location.href = '${process.env.FRONTEND_URL}/api-integrations?success=github';
                        }
                    </script>
                    <p>Redirecting...</p>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error in GitHub OAuth callback:', error);
        res.send(`
            <html>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({ type: 'oauth-error', provider: 'github', error: 'callback_failed' }, '${process.env.FRONTEND_URL}');
                            window.close();
                        } else {
                            window.location.href = '${process.env.FRONTEND_URL}/api-integrations?error=callback_failed';
                        }
                    </script>
                    <p>Connection failed. Closing...</p>
                </body>
            </html>
        `);
    }
};

// @desc    Initiate Azure DevOps OAuth flow
// @route   GET /api/oauth/azure/connect
// @access  Private
exports.initiateAzureOAuth = (req, res) => {
    const clientId = process.env.AZURE_CLIENT_ID;
    const redirectUri = process.env.AZURE_CALLBACK_URL;
    const tenantId = process.env.AZURE_TENANT_ID || 'common';
    const state = Buffer.from(JSON.stringify({ userId: req.user._id })).toString('base64');

    // Use Microsoft Entra ID (formerly Azure AD) with Azure DevOps resource
    // Resource ID for Azure DevOps: 499b84ac-1321-427f-aa17-267ca6975798
    const azureAuthUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=499b84ac-1321-427f-aa17-267ca6975798/.default&state=${state}`;

    res.redirect(azureAuthUrl);
};

// @desc    Handle Azure DevOps OAuth callback
// @route   GET /api/oauth/azure/callback
// @access  Public (but uses state token)
exports.handleAzureCallback = async (req, res, next) => {
    try {
        const { code, state, error, error_description } = req.query;

        // Check if Azure returned an error
        if (error) {
            console.error('Azure OAuth error:', error, error_description);
            return res.send(`
                <html>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({ type: 'oauth-error', provider: 'azure', error: '${error}: ${error_description || ''}' }, '${process.env.FRONTEND_URL}');
                                window.close();
                            } else {
                                window.location.href = '${process.env.FRONTEND_URL}/api-integrations?error=${error}';
                            }
                        </script>
                        <p>Error: ${error_description || error}. Closing...</p>
                    </body>
                </html>
            `);
        }

        if (!code) {
            console.error('No authorization code/assertion provided');
            return res.send(`
                <html>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({ type: 'oauth-error', provider: 'azure', error: 'no_code' }, '${process.env.FRONTEND_URL}');
                                window.close();
                            } else {
                                window.location.href = '${process.env.FRONTEND_URL}/api-integrations?error=no_code';
                            }
                        </script>
                        <p>Error occurred. Closing...</p>
                    </body>
                </html>
            `);
        }

        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
        const userId = decodedState.userId;

        const tenantId = process.env.AZURE_TENANT_ID || 'common';

        // Exchange code for access token using Microsoft Entra ID
        const tokenResponse = await axios.post(
            `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
            new URLSearchParams({
                client_id: process.env.AZURE_CLIENT_ID,
                client_secret: process.env.AZURE_CLIENT_SECRET,
                code,
                redirect_uri: process.env.AZURE_CALLBACK_URL,
                grant_type: 'authorization_code',
                scope: '499b84ac-1321-427f-aa17-267ca6975798/.default'
            }),
            {
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        if (!access_token) {
            return res.send(`
                <html>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({ type: 'oauth-error', provider: 'azure', error: 'no_token' }, '${process.env.FRONTEND_URL}');
                                window.close();
                            } else {
                                window.location.href = '${process.env.FRONTEND_URL}/api-integrations?error=no_token';
                            }
                        </script>
                        <p>Error occurred. Closing...</p>
                    </body>
                </html>
            `);
        }

        // Fetch user profile from Azure DevOps
        const profileResponse = await axios.get('https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=6.0', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const azureUser = profileResponse.data;

        // Save or update credentials
        let credential = await SourceCredential.findOne({
            user: userId,
            provider: 'azure'
        });

        const expiresAt = new Date(Date.now() + expires_in * 1000);

        if (credential) {
            credential.accessToken = access_token;
            credential.refreshToken = refresh_token;
            credential.expiresAt = expiresAt;
            credential.providerUserId = azureUser.id;
            credential.providerUsername = azureUser.displayName;
            credential.providerEmail = azureUser.emailAddress;
            credential.isActive = true;
            await credential.save();
        } else {
            const hasExistingCredentials = await SourceCredential.findOne({ user: userId });
            
            credential = await SourceCredential.create({
                user: userId,
                provider: 'azure',
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt,
                providerUserId: azureUser.id,
                providerUsername: azureUser.displayName,
                providerEmail: azureUser.emailAddress,
                isActive: true,
                isDefault: !hasExistingCredentials // First provider is default
            });
        }

        // Send HTML that closes popup and notifies parent
        res.send(`
            <html>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({ type: 'oauth-success', provider: 'azure' }, '${process.env.FRONTEND_URL}');
                            window.close();
                        } else {
                            window.location.href = '${process.env.FRONTEND_URL}/api-integrations?success=azure';
                        }
                    </script>
                    <p>Redirecting...</p>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('=== Error in Azure OAuth callback ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.response) {
            console.error('Azure API error response:', error.response.status, error.response.data);
        }
        
        const errorMessage = error.response?.data?.error_description || error.message || 'callback_failed';
        res.send(`
            <html>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({ type: 'oauth-error', provider: 'azure', error: '${errorMessage.replace(/'/g, "\\'")}' }, '${process.env.FRONTEND_URL}');
                            window.close();
                        } else {
                            window.location.href = '${process.env.FRONTEND_URL}/api-integrations?error=callback_failed';
                        }
                    </script>
                    <p>Connection failed: ${errorMessage}. Closing...</p>
                </body>
            </html>
        `);
    }
};

// @desc    Initiate Bitbucket OAuth flow
// @route   GET /api/oauth/bitbucket/connect
// @access  Private
exports.initiateBitbucketOAuth = (req, res) => {
    const clientId = process.env.BITBUCKET_CLIENT_ID;
    const redirectUri = process.env.BITBUCKET_CALLBACK_URL;
    const state = Buffer.from(JSON.stringify({ userId: req.user._id })).toString('base64');

    const bitbucketAuthUrl = `https://bitbucket.org/site/oauth2/authorize?client_id=${clientId}&response_type=code&state=${state}`;

    res.redirect(bitbucketAuthUrl);
};

// @desc    Handle Bitbucket OAuth callback
// @route   GET /api/oauth/bitbucket/callback
// @access  Public (but uses state token)
exports.handleBitbucketCallback = async (req, res, next) => {
    try {
        const { code, state } = req.query;

        if (!code) {
            return res.send(`
                <html>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({ type: 'oauth-error', provider: 'bitbucket', error: 'no_code' }, '${process.env.FRONTEND_URL}');
                                window.close();
                            } else {
                                window.location.href = '${process.env.FRONTEND_URL}/api-integrations?error=no_code';
                            }
                        </script>
                        <p>Error occurred. Closing...</p>
                    </body>
                </html>
            `);
        }

        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
        const userId = decodedState.userId;

        // Exchange code for access token
        const tokenResponse = await axios.post('https://bitbucket.org/site/oauth2/access_token', 
            new URLSearchParams({
                grant_type: 'authorization_code',
                code
            }),
            {
                auth: {
                    username: process.env.BITBUCKET_CLIENT_ID,
                    password: process.env.BITBUCKET_CLIENT_SECRET
                },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        if (!access_token) {
            return res.send(`
                <html>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({ type: 'oauth-error', provider: 'bitbucket', error: 'no_token' }, '${process.env.FRONTEND_URL}');
                                window.close();
                            } else {
                                window.location.href = '${process.env.FRONTEND_URL}/api-integrations?error=no_token';
                            }
                        </script>
                        <p>Error occurred. Closing...</p>
                    </body>
                </html>
            `);
        }

        // Fetch user info from Bitbucket
        const userResponse = await axios.get('https://api.bitbucket.org/2.0/user', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const bitbucketUser = userResponse.data;

        // Save or update credentials
        let credential = await SourceCredential.findOne({
            user: userId,
            provider: 'bitbucket'
        });

        const expiresAt = new Date(Date.now() + expires_in * 1000);

        if (credential) {
            credential.accessToken = access_token;
            credential.refreshToken = refresh_token;
            credential.expiresAt = expiresAt;
            credential.providerUserId = bitbucketUser.uuid;
            credential.providerUsername = bitbucketUser.username;
            credential.providerEmail = bitbucketUser.email;
            credential.isActive = true;
            await credential.save();
        } else {
            const hasExistingCredentials = await SourceCredential.findOne({ user: userId });
            
            credential = await SourceCredential.create({
                user: userId,
                provider: 'bitbucket',
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt,
                providerUserId: bitbucketUser.uuid,
                providerUsername: bitbucketUser.username,
                providerEmail: bitbucketUser.email,
                isActive: true,
                isDefault: !hasExistingCredentials // First provider is default
            });
        }

        // Send HTML that closes popup and notifies parent
        res.send(`
            <html>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({ type: 'oauth-success', provider: 'bitbucket' }, '${process.env.FRONTEND_URL}');
                            window.close();
                        } else {
                            window.location.href = '${process.env.FRONTEND_URL}/api-integrations?success=bitbucket';
                        }
                    </script>
                    <p>Redirecting...</p>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error in Bitbucket OAuth callback:', error);
        res.send(`
            <html>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({ type: 'oauth-error', provider: 'bitbucket', error: 'callback_failed' }, '${process.env.FRONTEND_URL}');
                            window.close();
                        } else {
                            window.location.href = '${process.env.FRONTEND_URL}/api-integrations?error=callback_failed';
                        }
                    </script>
                    <p>Connection failed. Closing...</p>
                </body>
            </html>
        `);
    }
};

// @desc    Disconnect OAuth provider
// @route   DELETE /api/oauth/:provider/disconnect
// @access  Private
exports.disconnectProvider = async (req, res, next) => {
    try {
        const { provider } = req.params;

        if (!['github', 'azure', 'bitbucket'].includes(provider)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid provider'
            });
        }

        const credential = await SourceCredential.findOne({
            user: req.user._id,
            provider
        });

        if (!credential) {
            return res.status(404).json({
                success: false,
                message: `No ${provider} connection found`
            });
        }

        await credential.deleteOne();

        res.status(200).json({
            success: true,
            message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected successfully`
        });
    } catch (error) {
        console.error('Error disconnecting provider:', error);
        next(error);
    }
};

module.exports.getAccessToken = getAccessToken;

