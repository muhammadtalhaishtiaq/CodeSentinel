const SourceCredential = require('../models/SourceCredential');
const Repository = require('../models/Repository');

// @desc    Get user's source credentials
// @route   GET /api/integrations/credentials
// @access  Private
exports.getSourceCredentials = async(req, res, next) => {
    try {
        const credentials = await SourceCredential.find({ user: req.user._id });

        // Return safe versions of credentials
        const safeCredentials = credentials.map(cred => ({
            id: cred._id,
            provider: cred.provider,
            isDefault: cred.isDefault,
            isActive: cred.isActive,
            githubToken: cred.provider === 'github' ? cred.githubToken : undefined,
            bitbucketUsername: cred.provider === 'bitbucket' ? cred.bitbucketUsername : undefined,
            bitbucketToken: cred.provider === 'bitbucket' ? cred.bitbucketToken : undefined,
            createdAt: cred.createdAt,
            updatedAt: cred.updatedAt
        }));

        res.status(200).json({
            success: true,
            data: safeCredentials
        });
    } catch (error) {
        console.error('Error fetching source credentials:', error);
        next(error);
    }
};

// @desc    Get source credential by ID
// @route   GET /api/integrations/credentials/:id
// @access  Private
exports.getSourceCredentialById = async(req, res, next) => {
    try {
        const credential = await SourceCredential.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!credential) {
            return res.status(404).json({
                success: false,
                message: 'Credential not found'
            });
        }

        // Return credential with sensitive data
        const safeCredential = {
            id: credential._id,
            provider: credential.provider,
            isDefault: credential.isDefault,
            isActive: credential.isActive,
            githubToken: credential.provider === 'github' ? credential.githubToken : undefined,
            bitbucketUsername: credential.provider === 'bitbucket' ? credential.bitbucketUsername : undefined,
            bitbucketToken: credential.provider === 'bitbucket' ? credential.bitbucketToken : undefined,
            createdAt: credential.createdAt,
            updatedAt: credential.updatedAt
        };

        res.status(200).json({
            success: true,
            data: safeCredential
        });
    } catch (error) {
        console.error('Error fetching credential by ID:', error);
        next(error);
    }
};

// @desc    Add or update source credentials
// @route   POST /api/integrations/credentials
// @access  Private
exports.addSourceCredential = async(req, res, next) => {
    try {
        const { provider, githubToken, bitbucketUsername, bitbucketToken, isDefault } = req.body;

        if (!provider) {
            return res.status(400).json({
                success: false,
                message: 'Provider type is required'
            });
        }

        // Check if this is just a default provider update
        const isDefaultUpdate = isDefault !== undefined && Object.keys(req.body).length <= 2; // only provider and isDefault provided

        if (!isDefaultUpdate) {
            // Validate required fields based on provider
            if (provider === 'github' && !githubToken) {
                return res.status(400).json({
                    success: false,
                    message: 'GitHub token is required'
                });
            }

            if (provider === 'bitbucket' && (!bitbucketUsername || !bitbucketToken)) {
                return res.status(400).json({
                    success: false,
                    message: 'Bitbucket username and token are required'
                });
            }
        }

        // Check if credentials already exist for this provider
        const existingCredential = await SourceCredential.findOne({
            user: req.user._id,
            provider
        });

        let credential;

        if (existingCredential) {
            // If this is just a default update, don't modify other fields
            if (!isDefaultUpdate) {
                // Update existing credential with new tokens
                if (provider === 'github') {
                    existingCredential.githubToken = githubToken;
                } else if (provider === 'bitbucket') {
                    existingCredential.bitbucketUsername = bitbucketUsername;
                    existingCredential.bitbucketToken = bitbucketToken;
                }
            }

            if (isDefault !== undefined) {
                existingCredential.isDefault = isDefault;
            }

            credential = await existingCredential.save();
        } else {
            // For default updates without existing credentials, return error
            if (isDefaultUpdate) {
                return res.status(404).json({
                    success: false,
                    message: `No ${provider} credentials found to set as default`
                });
            }

            // Create new credential
            const credentialData = {
                user: req.user._id,
                provider,
                isDefault: isDefault !== undefined ? isDefault : false
            };

            if (provider === 'github') {
                credentialData.githubToken = githubToken;
            } else if (provider === 'bitbucket') {
                credentialData.bitbucketUsername = bitbucketUsername;
                credentialData.bitbucketToken = bitbucketToken;
            }

            credential = await SourceCredential.create(credentialData);
        }

        res.status(200).json({
            success: true,
            data: {
                id: credential._id,
                provider: credential.provider,
                isDefault: credential.isDefault,
                isActive: credential.isActive,
                githubToken: credential.provider === 'github' ? credential.githubToken : undefined,
                bitbucketUsername: credential.provider === 'bitbucket' ? credential.bitbucketUsername : undefined,
                bitbucketToken: credential.provider === 'bitbucket' ? credential.bitbucketToken : undefined,
                createdAt: credential.createdAt,
                updatedAt: credential.updatedAt
            },
            message: isDefaultUpdate ?
                `${provider.charAt(0).toUpperCase() + provider.slice(1)} set as default provider` :
                (existingCredential ? 'Credentials updated successfully' : 'Credentials added successfully')
        });
    } catch (error) {
        console.error('Error adding/updating source credential:', error);
        next(error);
    }
};

// @desc    Test source credentials connection
// @route   POST /api/integrations/test-connection
// @access  Private
exports.testConnection = async(req, res, next) => {
    try {
        const { provider, githubToken, bitbucketUsername, bitbucketToken } = req.body;
        console.log(`[DEBUG] Validating integration for provider: ${provider}`);
        console.log(`[DEBUG] Request body:`, JSON.stringify({
            provider,
            githubToken: githubToken ? '***token-redacted***' : undefined,
            bitbucketUsername,
            bitbucketToken: bitbucketToken ? '***token-redacted***' : undefined
        }));

        if (!provider) {
            console.log('[DEBUG] Error: Provider type is missing');
            return res.status(400).json({
                success: false,
                message: 'Provider type is required'
            });
        }

        let isValid = false;
        let errorMessage = '';

        if (provider === 'github') {
            if (!githubToken) {
                console.log('[DEBUG] Error: GitHub token is missing');
                return res.status(400).json({
                    success: false,
                    message: 'GitHub token is required'
                });
            }

            try {
                console.log('[DEBUG] Testing GitHub token by calling GitHub API...');
                // Test GitHub token by fetching user info
                const response = await fetch('https://api.github.com/user', {
                    method: 'GET',
                    headers: {
                        Authorization: `token ${githubToken}`,
                        Accept: 'application/vnd.github.v3+json'
                    }
                });

                console.log(`[DEBUG] GitHub API response status: ${response.status}`);
                const responseText = await response.text();
                console.log(`[DEBUG] GitHub API response body: ${responseText}`);

                let responseData;
                try {
                    responseData = JSON.parse(responseText);
                } catch (e) {
                    console.log('[DEBUG] Failed to parse GitHub response as JSON');
                }

                if (response.ok) {
                    console.log(`[DEBUG] GitHub validation successful. Username: ${responseData && responseData.login ? responseData.login : 'unknown'}`);
                    isValid = true;
                } else {
                    errorMessage = responseData && responseData.message ? responseData.message : 'Failed to connect to GitHub API';
                    console.log(`[DEBUG] GitHub validation failed: ${errorMessage}`);
                }
            } catch (error) {
                errorMessage = error.message || 'Failed to connect to GitHub API';
                console.log(`[DEBUG] GitHub API connection error: ${error.message}`);
                console.log(error);
            }
        } else if (provider === 'bitbucket') {
            if (!bitbucketUsername || !bitbucketToken) {
                console.log('[DEBUG] Error: Bitbucket credentials incomplete');
                return res.status(400).json({
                    success: false,
                    message: 'Bitbucket username and token are required'
                });
            }

            try {
                console.log('[DEBUG] Testing Bitbucket credentials by calling Bitbucket API...');
                // Test Bitbucket credentials by fetching user info
                const authHeader = 'Basic ' + Buffer.from(`${bitbucketUsername}:${bitbucketToken}`).toString('base64');
                const response = await fetch('https://api.bitbucket.org/2.0/user', {
                    method: 'GET',
                    headers: {
                        Authorization: authHeader
                    }
                });

                console.log(`[DEBUG] Bitbucket API response status: ${response.status}`);
                const responseText = await response.text();
                console.log(`[DEBUG] Bitbucket API response body: ${responseText}`);

                let responseData;
                try {
                    responseData = JSON.parse(responseText);
                } catch (e) {
                    console.log('[DEBUG] Failed to parse Bitbucket response as JSON');
                }

                if (response.ok) {
                    console.log(`[DEBUG] Bitbucket validation successful. Username: ${responseData && responseData.username ? responseData.username : 'unknown'}`);
                    isValid = true;
                } else {
                    errorMessage = (responseData && responseData.error && responseData.error.message) ? responseData.error.message : 'Failed to connect to Bitbucket API';
                    console.log(`[DEBUG] Bitbucket validation failed: ${errorMessage}`);
                }
            } catch (error) {
                errorMessage = error.message || 'Failed to connect to Bitbucket API';
                console.log(`[DEBUG] Bitbucket API connection error: ${error.message}`);
                console.log(error);
            }
        } else {
            console.log(`[DEBUG] Unsupported provider: ${provider}`);
            return res.status(400).json({
                success: false,
                message: 'Unsupported provider'
            });
        }

        console.log(`[DEBUG] Integration validation result: ${isValid ? 'Valid' : 'Invalid'}`);
        if (!isValid) {
            console.log(`[DEBUG] Error message: ${errorMessage}`);
        }

        res.status(200).json({
            success: true,
            data: {
                isValid,
                errorMessage: isValid ? '' : errorMessage
            }
        });
    } catch (error) {
        console.log('[DEBUG] Unexpected error in validateIntegration:');
        console.log(error);
        next(error);
    }
};

// @desc    Get user's repositories
// @route   GET /api/integrations/repositories
// @access  Private
exports.getRepositories = async(req, res, next) => {
    try {
        const repositories = await Repository.find({ user: req.user._id });

        res.status(200).json({
            success: true,
            data: repositories
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle repository status (enable/disable)
// @route   PATCH /api/integrations/repositories/:id/toggle
// @access  Private
exports.toggleRepository = async(req, res, next) => {
    try {
        const repository = await Repository.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!repository) {
            return res.status(404).json({
                success: false,
                message: 'Repository not found'
            });
        }

        repository.isEnabled = !repository.isEnabled;
        await repository.save();

        res.status(200).json({
            success: true,
            data: repository,
            message: repository.isEnabled ? 'Repository enabled' : 'Repository disabled'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a repository
// @route   DELETE /api/integrations/repositories/:id
// @access  Private
exports.deleteRepository = async(req, res, next) => {
    try {
        const repository = await Repository.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!repository) {
            return res.status(404).json({
                success: false,
                message: 'Repository not found'
            });
        }

        await repository.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Repository removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Sync repositories from provider
// @route   POST /api/integrations/sync-repositories
// @access  Private
exports.syncRepositories = async(req, res, next) => {
    try {
        const { provider } = req.body;

        if (!provider) {
            return res.status(400).json({
                success: false,
                message: 'Provider type is required'
            });
        }

        // Find credentials for the specified provider
        const credential = await SourceCredential.findOne({
            user: req.user._id,
            provider,
            isActive: true
        });

        if (!credential) {
            return res.status(404).json({
                success: false,
                message: `No active ${provider} credentials found`
            });
        }

        let repositories = [];

        if (provider === 'github') {
            try {
                // Fetch GitHub repositories
                const response = await fetch('https://api.github.com/user/repos?per_page=100', {
                    method: 'GET',
                    headers: {
                        Authorization: `token ${credential.githubToken}`,
                        Accept: 'application/vnd.github.v3+json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    repositories = data.map(repo => ({
                        name: repo.full_name,
                        repoId: repo.id.toString(),
                        provider: 'github'
                    }));
                } else {
                    const errorData = await response.json();
                    return res.status(500).json({
                        success: false,
                        message: errorData.message || 'Failed to fetch GitHub repositories'
                    });
                }
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch GitHub repositories'
                });
            }
        } else if (provider === 'bitbucket') {
            try {
                // Fetch Bitbucket repositories
                const authHeader = 'Basic ' + Buffer.from(`${credential.bitbucketUsername}:${credential.bitbucketToken}`).toString('base64');
                const response = await fetch('https://api.bitbucket.org/2.0/repositories', {
                    method: 'GET',
                    headers: {
                        Authorization: authHeader
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    repositories = data.values.map(repo => ({
                        name: repo.full_name,
                        repoId: repo.uuid,
                        provider: 'bitbucket'
                    }));
                } else {
                    const errorData = await response.json();
                    return res.status(500).json({
                        success: false,
                        message: (errorData.error && errorData.error.message) || 'Failed to fetch Bitbucket repositories'
                    });
                }
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch Bitbucket repositories'
                });
            }
        }

        // Save repositories to database
        const savedRepos = [];

        for (const repo of repositories) {
            try {
                // Check if repository already exists
                let existingRepo = await Repository.findOne({
                    user: req.user._id,
                    provider: repo.provider,
                    repoId: repo.repoId
                });

                if (existingRepo) {
                    // Update existing repository
                    existingRepo.name = repo.name;
                    existingRepo.updatedAt = Date.now();
                    await existingRepo.save();
                    savedRepos.push(existingRepo);
                } else {
                    // Create new repository
                    const newRepo = await Repository.create({
                        user: req.user._id,
                        sourceCredential: credential._id,
                        name: repo.name,
                        provider: repo.provider,
                        repoId: repo.repoId
                    });
                    savedRepos.push(newRepo);
                }
            } catch (error) {
                console.error(`Error saving repository ${repo.name}:`, error);
            }
        }

        res.status(200).json({
            success: true,
            data: savedRepos,
            message: `${savedRepos.length} repositories synced successfully`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update default provider
// @route   PATCH /api/integrations/default-provider
// @access  Private
exports.updateDefaultProvider = async(req, res, next) => {
    try {
        const { provider } = req.body;

        if (!provider) {
            return res.status(400).json({
                success: false,
                message: 'Provider type is required'
            });
        }

        if (provider !== 'github' && provider !== 'bitbucket') {
            return res.status(400).json({
                success: false,
                message: 'Invalid provider. Must be "github" or "bitbucket"'
            });
        }

        // Check if credentials exist for this provider
        const existingCredential = await SourceCredential.findOne({
            user: req.user._id,
            provider
        });

        if (!existingCredential) {
            return res.status(404).json({
                success: false,
                message: `No ${provider} credentials found to set as default`
            });
        }

        // Update the default status
        existingCredential.isDefault = true;
        await existingCredential.save();

        // Reset any other credentials to non-default
        await SourceCredential.updateMany({ user: req.user._id, _id: { $ne: existingCredential._id }, isDefault: true }, { $set: { isDefault: false } });

        res.status(200).json({
            success: true,
            message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} set as default provider`,
            data: {
                provider,
                isDefault: true
            }
        });
    } catch (error) {
        console.error('Error updating default provider:', error);
        next(error);
    }
};