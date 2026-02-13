const SourceCredential = require('../models/SourceCredential');
const Repository = require('../models/Repository');
const path = require('path');
const fs = require('fs/promises');
const { getAccessToken } = require('./oauth');

/**
 * Sanitize a credential object to strip sensitive tokens before returning in API responses.
 * Only returns safe, non-secret fields.
 */
const sanitizeCredential = (cred) => ({
    _id: cred._id,
    provider: cred.provider,
    isDefault: cred.isDefault,
    isActive: cred.isActive,
    providerUsername: cred.providerUsername,
    providerEmail: cred.providerEmail,
    createdAt: cred.createdAt,
    updatedAt: cred.updatedAt
});

const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
    }
};

// @desc    Get user's source credentials
// @route   GET /api/integrations/credentials
// @access  Private
exports.getSourceCredentials = async(req, res, next) => {
    try {
        const credentials = await SourceCredential.find({ user: req.user._id });

        // Return safe versions of credentials (no tokens/secrets)
        const safeCredentials = credentials.map(sanitizeCredential);

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

        // Return credential without sensitive tokens
        res.status(200).json({
            success: true,
            data: sanitizeCredential(credential)
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
        const { provider, githubToken, bitbucketUsername, bitbucketToken, azureOrganization, azurePat, isDefault } = req.body;

        console.log('[DEBUG] addSourceCredential called with provider:', provider);

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

            if (provider === 'azure' && (!azureOrganization || !azurePat)) {
                return res.status(400).json({
                    success: false,
                    message: 'Azure organization and Personal Access Token are required'
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
                } else if (provider === 'azure') {
                    // Clean organization name (remove URL if present)
                    let cleanOrg = azureOrganization.trim();
                    if (cleanOrg.includes('dev.azure.com/')) {
                        cleanOrg = cleanOrg.split('dev.azure.com/')[1].split('/')[0];
                    }
                    existingCredential.azureOrganization = cleanOrg;
                    existingCredential.azurePat = azurePat;
                    existingCredential.providerUsername = cleanOrg; // For display
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
            } else if (provider === 'azure') {
                // Clean organization name (remove URL if present)
                let cleanOrg = azureOrganization.trim();
                if (cleanOrg.includes('dev.azure.com/')) {
                    cleanOrg = cleanOrg.split('dev.azure.com/')[1].split('/')[0];
                }
                credentialData.azureOrganization = cleanOrg;
                credentialData.azurePat = azurePat;
                credentialData.providerUsername = cleanOrg; // For display
            }

            credential = await SourceCredential.create(credentialData);
            console.log('[DEBUG] ✅ New Azure credential created:', credential._id);
        }

        res.status(200).json({
            success: true,
            data: sanitizeCredential(credential),
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
        const { provider, githubToken, bitbucketUsername, bitbucketToken, azureOrganization, azurePat } = req.body;
        console.log(`[DEBUG] Validating integration for provider: ${provider}`);

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

                let responseData;
                try {
                    const responseText = await response.text();
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

                let responseData;
                try {
                    const responseText = await response.text();
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
        } else if (provider === 'azure') {
            if (!azureOrganization || !azurePat) {
                console.log('[DEBUG] Error: Azure credentials incomplete');
                return res.status(400).json({
                    success: false,
                    message: 'Azure organization and Personal Access Token are required'
                });
            }

            try {
                console.log('[DEBUG] Testing Azure credentials by calling Azure DevOps API...');
                // Clean organization name
                let cleanOrg = azureOrganization.trim();
                if (cleanOrg.includes('dev.azure.com/')) {
                    cleanOrg = cleanOrg.split('dev.azure.com/')[1].split('/')[0];
                }
                
                // Test Azure DevOps credentials by fetching projects
                const authHeader = 'Basic ' + Buffer.from(`:${azurePat}`).toString('base64');
                const testUrl = `https://dev.azure.com/${cleanOrg}/_apis/projects?api-version=7.0`;
                const response = await fetch(testUrl, {
                    method: 'GET',
                    headers: {
                        Authorization: authHeader,
                        Accept: 'application/json'
                    }
                });

                console.log(`[DEBUG] Azure API response status: ${response.status}`);

                let responseData;
                try {
                    const responseText = await response.text();
                    responseData = JSON.parse(responseText);
                } catch (e) {
                    console.log('[DEBUG] Failed to parse Azure response as JSON');
                }

                if (response.ok) {
                    const projectCount = responseData && responseData.count !== undefined ? responseData.count : 0;
                    console.log(`[DEBUG] Azure validation successful. Projects found: ${projectCount}`);
                    isValid = true;
                } else {
                    errorMessage = (responseData && responseData.message) ? responseData.message : 'Failed to connect to Azure DevOps API';
                    console.log(`[DEBUG] Azure validation failed: ${errorMessage}`);
                }
            } catch (error) {
                errorMessage = error.message || 'Failed to connect to Azure DevOps API';
                console.log(`[DEBUG] Azure API connection error: ${error.message}`);
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
        const repositories = await Repository.find({ user: req.user._id }).sort({ _id: -1 });

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

        const accessToken = getAccessToken(credential);

        if (provider === 'github') {
            if (!accessToken) {
                return res.status(401).json({
                    success: false,
                    message: 'No valid access token found. Please reconnect your account.'
                });
            }
            try {
                // Fetch GitHub repositories
                const response = await fetch('https://api.github.com/user/repos?per_page=100', {
                    method: 'GET',
                    headers: {
                        Authorization: `token ${accessToken}`,
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
        } else if (provider === 'azure') {
            try {
                const orgName = (credential.azureOrganization || process.env.AZURE_ORGANIZATION || process.env.AZURE_ORG || '').trim();
                const projectName = (process.env.AZURE_PROJECT || '').trim();
                const pat = credential.azurePat;

                if (!orgName || !pat) {
                    return res.status(401).json({
                        success: false,
                        message: 'Azure organization and PAT are required to sync repositories.'
                    });
                }

                const authHeader = 'Basic ' + Buffer.from(`:${pat}`).toString('base64');
                const projectsResponse = await fetchWithTimeout(`https://dev.azure.com/${orgName}/_apis/projects?api-version=7.0`, {
                    headers: {
                        Authorization: authHeader,
                        Accept: 'application/json'
                    }
                });

                if (!projectsResponse.ok) {
                    const errorData = await projectsResponse.json();
                    throw new Error(errorData.message || 'Failed to fetch Azure DevOps projects');
                }

                const projectsData = await projectsResponse.json();
                const projects = projectsData.value || [];
                const filteredProjects = projectName
                    ? projects.filter((project) => project.name && project.name.toLowerCase() === projectName.toLowerCase())
                    : projects;

                if (projectName && filteredProjects.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `Azure project not found: ${projectName}`
                    });
                }

                for (const project of filteredProjects) {
                    const reposResponse = await fetchWithTimeout(
                        `https://dev.azure.com/${orgName}/${project.id}/_apis/git/repositories?api-version=7.0`,
                        {
                            headers: {
                                Authorization: authHeader,
                                Accept: 'application/json'
                            }
                        }
                    );

                    if (reposResponse.ok) {
                        const reposData = await reposResponse.json();
                        reposData.value.forEach(repo => {
                            repositories.push({
                                name: `${orgName}/${project.name}/${repo.name}`,
                                repoId: repo.id,
                                provider: 'azure'
                            });
                        });
                    }
                }
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch Azure DevOps repositories'
                });
            }
        } else if (provider === 'bitbucket') {
            try {
                // Fetch Bitbucket repositories — support both OAuth and Basic auth
                let authHeader;
                if (credential.accessToken) {
                    authHeader = `Bearer ${credential.accessToken}`;
                } else if (credential.bitbucketUsername && credential.bitbucketToken) {
                    authHeader = 'Basic ' + Buffer.from(`${credential.bitbucketUsername}:${credential.bitbucketToken}`).toString('base64');
                } else {
                    return res.status(401).json({
                        success: false,
                        message: 'No valid Bitbucket credentials found. Please reconnect your account.'
                    });
                }

                const response = await fetch('https://api.bitbucket.org/2.0/repositories?role=member', {
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
        const errors = [];

        for (const repo of repositories) {
            try {
                // Use findOneAndUpdate with upsert to handle duplicates atomically
                const savedRepo = await Repository.findOneAndUpdate(
                    {
                        user: req.user._id,
                        provider: repo.provider,
                        repoId: repo.repoId
                    },
                    {
                        $set: {
                            name: repo.name,
                            sourceCredential: credential._id,
                            updatedAt: Date.now()
                        },
                        $setOnInsert: {
                            user: req.user._id,
                            provider: repo.provider,
                            repoId: repo.repoId,
                            isEnabled: false, // New repos default to unselected
                            connectedAt: Date.now()
                        }
                    },
                    {
                        upsert: true,
                        new: true,
                        runValidators: true
                    }
                );
                savedRepos.push(savedRepo);
            } catch (error) {
                console.error(`Error saving repository ${repo.name}:`, error);
                errors.push({ repo: repo.name, error: error.message });
            }
        }

        const response = {
            success: true,
            data: savedRepos,
            message: `${savedRepos.length} repositories synced successfully`
        };

        if (errors.length > 0) {
            response.warnings = errors;
            response.message += ` (${errors.length} errors occurred)`;
        }

        res.status(200).json(response);
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

        if (!['github', 'bitbucket', 'azure'].includes(provider)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid provider. Must be "github", "bitbucket", or "azure"'
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

// @desc    Fetch code from GitHub repository branch
// @route   POST /api/integrations/fetch-code
// @access  Private
exports.fetchRepositoryCode = async(req, res, next) => {
    try {
        const { repositoryId, branch } = req.body;
        console.log(`[DEBUG] Starting fetchRepositoryCode for repositoryId: ${repositoryId}, branch: ${branch}`);

        if (!repositoryId || !branch) {
            console.log('[DEBUG] Missing required parameters:', { repositoryId, branch });
            return res.status(400).json({
                success: false,
                message: 'Repository ID and branch are required'
            });
        }

        // Find repository and credentials
        console.log('[DEBUG] Looking up repository and credentials...');
        const repository = await Repository.findOne({
            _id: repositoryId,
            user: req.user._id
        });

        if (!repository) {
            console.log('[DEBUG] Repository not found');
            return res.status(404).json({
                success: false,
                message: 'Repository not found'
            });
        }
        console.log(`[DEBUG] Found repository: ${repository.name}`);

        const credential = await SourceCredential.findOne({
            user: req.user._id,
            provider: repository.provider,
            isActive: true
        });

        if (!credential) {
            console.log('[DEBUG] No active credentials found');
            return res.status(404).json({
                success: false,
                message: 'No active credentials found'
            });
        }
        console.log('[DEBUG] Found active credentials');

        // Create temp directory for this scan
        const tempDir = path.join(process.cwd(), 'server', 'temp', `${repository._id}_${Date.now()}`);
        console.log(`[DEBUG] Creating temp directory: ${tempDir}`);
        await fs.mkdir(tempDir, { recursive: true });

        // First, get the list of changed files in this branch
        console.log(`[DEBUG] Fetching branch changes from GitHub API...`);
        const compareResponse = await fetch(`https://api.github.com/repos/${repository.name}/compare/main...${branch}`, {
            headers: {
                Authorization: `token ${credential.githubToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        if (!compareResponse.ok) {
            const errorData = await compareResponse.json();
            console.log(`[DEBUG] Failed to fetch branch changes. Status: ${compareResponse.status}, Error:`, errorData);
            throw new Error(errorData.message || 'Failed to fetch branch changes');
        }

        const compareData = await compareResponse.json();
        const changedFiles = compareData.files || [];
        console.log(`[DEBUG] Found ${changedFiles.length} changed files in branch`);

        // Filter for only text files that were modified or added
        const textFiles = changedFiles.filter(file =>
            file.status !== 'removed' &&
            !file.filename.endsWith('.png') &&
            !file.filename.endsWith('.jpg') &&
            !file.filename.endsWith('.jpeg') &&
            !file.filename.endsWith('.gif') &&
            !file.filename.endsWith('.ico') &&
            !file.filename.endsWith('.svg') &&
            !file.filename.endsWith('.pdf') &&
            !file.filename.endsWith('.zip') &&
            !file.filename.endsWith('.tar') &&
            !file.filename.endsWith('.gz')
        );
        console.log(`[DEBUG] Filtered to ${textFiles.length} text files`);

        const files = [];
        let successCount = 0;
        let errorCount = 0;

        // Fetch only the changed files
        console.log('[DEBUG] Starting to fetch individual file contents...');
        for (const file of textFiles) {
            try {
                console.log(`[DEBUG] Fetching content for: ${file.filename}`);
                const fileResponse = await fetch(`https://api.github.com/repos/${repository.name}/contents/${file.filename}?ref=${branch}`, {
                    headers: {
                        Authorization: `token ${credential.githubToken}`,
                        Accept: 'application/vnd.github.v3.raw'
                    }
                });

                if (!fileResponse.ok) {
                    const errorData = await fileResponse.json();
                    console.log(`[DEBUG] Failed to fetch ${file.filename}. Status: ${fileResponse.status}, Error:`, errorData);
                    errorCount++;
                    continue;
                }

                const content = await fileResponse.text();
                const filePath = path.join(tempDir, file.filename);
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, content);
                files.push({
                    path: file.filename,
                    content
                });
                successCount++;
                console.log(`[DEBUG] Successfully fetched: ${file.filename}`);
            } catch (error) {
                console.error(`[DEBUG] Error fetching ${file.filename}:`, error);
                errorCount++;
            }
        }

        console.log(`[DEBUG] File fetch complete. Success: ${successCount}, Errors: ${errorCount}`);
        console.log(`[DEBUG] Total files to analyze: ${files.length}`);

        res.status(200).json({
            success: true,
            data: {
                files,
                tempDir,
                totalFiles: textFiles.length,
                successCount,
                errorCount
            }
        });
    } catch (error) {
        console.error('[DEBUG] Error in fetchRepositoryCode:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch repository code'
        });
    }
};

// @desc    Get pull requests for a repository
// @route   POST /api/integrations/pull-requests
// @access  Private
exports.getPullRequests = async(req, res, next) => {
    try {
        const { repositoryId } = req.body;

        if (!repositoryId) {
            return res.status(400).json({
                success: false,
                message: 'Repository ID is required'
            });
        }

        // Get the repository details
        const repository = await Repository.findOne({
            _id: repositoryId,
            user: req.user._id
        });

        if (!repository) {
            return res.status(404).json({
                success: false,
                message: 'Repository not found'
            });
        }

        // Get credentials for the provider
        const credential = await SourceCredential.findOne({
            user: req.user._id,
            provider: repository.provider,
            isActive: true
        });

        if (!credential) {
            return res.status(404).json({
                success: false,
                message: `No ${repository.provider} credentials found`
            });
        }

        let pullRequests = [];

        // Fetch PRs based on provider
        if (repository.provider === 'github') {
            // GitHub API - Get ALL PRs (open + closed + draft)
            const response = await fetchWithTimeout(
                `https://api.github.com/repos/${repository.name}/pulls?state=all&per_page=100`,
                {
                    headers: {
                        'Authorization': `token ${credential.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }

            const data = await response.json();
            pullRequests = data.map(pr => ({
                id: pr.number,
                title: pr.title,
                number: pr.number,
                branch: pr.head.ref,
                author: pr.user.login,
                createdAt: pr.created_at,
                url: pr.html_url
            }));

        } else if (repository.provider === 'bitbucket') {
            // Bitbucket API - Get ALL PRs (all statuses)
            const response = await fetchWithTimeout(
                `https://api.bitbucket.org/2.0/repositories/${repository.name}/pullrequests?state=OPEN&state=MERGED&state=DECLINED&pagelen=100`,
                {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${credential.bitbucketUsername}:${credential.bitbucketToken}`).toString('base64')}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Bitbucket API error: ${response.statusText}`);
            }

            const data = await response.json();
            pullRequests = (data.values || []).map(pr => ({
                id: pr.id,
                title: pr.title,
                number: pr.id,
                branch: pr.source.branch.name,
                author: pr.author.display_name,
                createdAt: pr.created_on,
                url: pr.links.html.href
            }));

        } else if (repository.provider === 'azure') {
            // Azure DevOps API - Get ALL PRs (all statuses: active, completed, abandoned)
            const [org, project, repo] = repository.name.split('/');
            const azureOrg = credential.azureOrganization || org;
            
            const response = await fetchWithTimeout(
                `https://dev.azure.com/${azureOrg}/${project}/_apis/git/repositories/${repo}/pullrequests?searchCriteria.status=all&api-version=7.0`,
                {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`:${credential.azurePat}`).toString('base64')}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Azure DevOps API error: ${response.statusText}`);
            }

            const data = await response.json();
            pullRequests = (data.value || []).map(pr => ({
                id: parseInt(pr.pullRequestId, 10),
                title: pr.title,
                number: parseInt(pr.pullRequestId, 10),
                branch: pr.sourceRefName.replace('refs/heads/', ''),
                author: pr.createdBy.displayName,
                createdAt: pr.creationDate,
                url: `https://dev.azure.com/${azureOrg}/${project}/_git/${repo}/pullrequest/${pr.pullRequestId}`
            }));
        }

        res.status(200).json({
            success: true,
            data: pullRequests,
            message: `Retrieved ${pullRequests.length} pull requests`,
            debug: {
                provider: repository.provider,
                fetchedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('[DEBUG] Error fetching pull requests:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch pull requests'
        });
    }
};

// @desc    Get file changes/diffs for a pull request
// @route   POST /api/integrations/pull-request-files
// @access  Private
exports.getPullRequestFiles = async(req, res, next) => {
    try {
        const { repositoryId, pullRequestNumber } = req.body;

        if (!repositoryId || !pullRequestNumber) {
            return res.status(400).json({
                success: false,
                message: 'Repository ID and Pull Request number are required'
            });
        }

        // Get the repository details
        const repository = await Repository.findOne({
            _id: repositoryId,
            user: req.user._id
        });

        if (!repository) {
            return res.status(404).json({
                success: false,
                message: 'Repository not found'
            });
        }

        // Get credentials for the provider
        const credential = await SourceCredential.findOne({
            user: req.user._id,
            provider: repository.provider,
            isActive: true
        });

        if (!credential) {
            return res.status(404).json({
                success: false,
                message: `No ${repository.provider} credentials found`
            });
        }

        let files = [];

        // Fetch PR file changes based on provider
        if (repository.provider === 'github') {
            // GitHub API - Get PR files with pagination (max 100 per page)
            let allFiles = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await fetchWithTimeout(
                    `https://api.github.com/repos/${repository.name}/pulls/${pullRequestNumber}/files?per_page=100&page=${page}`,
                    {
                        headers: {
                            'Authorization': `token ${credential.githubToken}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (!Array.isArray(data) || data.length === 0) {
                    hasMore = false;
                } else {
                    allFiles = allFiles.concat(data);
                    page++;
                    // Safety limit
                    if (allFiles.length > 5000) {
                        hasMore = false;
                    }
                }
            }

            console.log(`[DEBUG] Found ${allFiles.length} files in GitHub PR #${pullRequestNumber}`);
            
            files = allFiles.map(file => ({
                filename: file.filename,
                status: file.status, // added, removed, modified, renamed
                additions: file.additions,
                deletions: file.deletions,
                changes: file.changes,
                patch: file.patch, // The actual diff
                previousFilename: file.previous_filename,
                blobUrl: file.blob_url,
                rawUrl: file.raw_url
            }));

        } else if (repository.provider === 'bitbucket') {
            // Bitbucket API - Get PR diff with pagination
            let allFiles = [];
            let page = 1;
            let maxPages = 50; // Prevent infinite loops
            let pageCount = 0;

            while (pageCount < maxPages && allFiles.length < 5000) {
                try {
                    const response = await fetchWithTimeout(
                        `https://api.bitbucket.org/2.0/repositories/${repository.name}/pullrequests/${pullRequestNumber}/diffstat?pagelen=100&page=${page}`,
                        {
                            headers: {
                                'Authorization': `Basic ${Buffer.from(`${credential.bitbucketUsername}:${credential.bitbucketToken}`).toString('base64')}`,
                                'Accept': 'application/json'
                            }
                        }
                    );

                    if (!response.ok) {
                        console.warn(`Bitbucket page ${page} API error: ${response.statusText} - stopping pagination`);
                        break;
                    }

                    const data = await response.json();
                    const values = data.values || [];
                    
                    if (values.length === 0) {
                        break;
                    }
                    
                    allFiles = allFiles.concat(values);
                    
                    // Check if there are more pages
                    if (!data.next) {
                        break;
                    }
                    
                    page++;
                    pageCount++;
                } catch (err) {
                    console.warn(`Bitbucket pagination error at page ${page}:`, err.message);
                    break;
                }
            }
            
            console.log(`[DEBUG] Fetched ${allFiles.length} files from Bitbucket PR #${pullRequestNumber} (${pageCount} pages)`);
            
            // Fetch the actual diff for each file
            const diffResponse = await fetchWithTimeout(
                `https://api.bitbucket.org/2.0/repositories/${repository.name}/pullrequests/${pullRequestNumber}/diff`,
                {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${credential.bitbucketUsername}:${credential.bitbucketToken}`).toString('base64')}`,
                        'Accept': 'text/plain'
                    }
                }
            );

            const diffText = await diffResponse.text();

            files = allFiles.map(file => ({
                filename: file.new?.path || file.old?.path || 'unknown',
                status: file.status, // added, removed, modified
                additions: file.lines_added || 0,
                deletions: file.lines_removed || 0,
                changes: (file.lines_added || 0) + (file.lines_removed || 0),
                patch: diffText, // Full diff text
                previousFilename: file.old?.path,
                type: file.type
            }));

        } else if (repository.provider === 'azure') {
            // Azure DevOps API - Use PR iterations endpoint (faster, no sequential calls)
            const [org, project, repo] = repository.name.split('/');
            const azureOrg = credential.azureOrganization || org;
            
            try {
                // Get PR iterations - this contains all accumulated changes
                const iterationsResponse = await fetchWithTimeout(
                    `https://dev.azure.com/${azureOrg}/${project}/_apis/git/repositories/${repo}/pullRequests/${pullRequestNumber}/iterations?api-version=7.0&$top=100`,
                    {
                        headers: {
                            'Authorization': `Basic ${Buffer.from(`:${credential.azurePat}`).toString('base64')}`,
                            'Accept': 'application/json'
                        }
                    }
                );

                if (iterationsResponse.ok) {
                    const iterationsData = await iterationsResponse.json();
                    const iterations = iterationsData.value || [];
                    
                    console.log(`[DEBUG] Found ${iterations.length} iterations in Azure PR #${pullRequestNumber}`);
                    
                    if (iterations.length > 0) {
                        // Get the LATEST iteration (contains all accumulated changes from all commits)
                        const latestIteration = iterations[iterations.length - 1];
                        
                        const changesResponse = await fetchWithTimeout(
                            `https://dev.azure.com/${azureOrg}/${project}/_apis/git/repositories/${repo}/pullRequests/${pullRequestNumber}/iterations/${latestIteration.id}/changes?api-version=7.0&$top=1000`,
                            {
                                headers: {
                                    'Authorization': `Basic ${Buffer.from(`:${credential.azurePat}`).toString('base64')}`,
                                    'Accept': 'application/json'
                                }
                            }
                        );

                        if (changesResponse.ok) {
                            const changesData = await changesResponse.json();
                            const changes = changesData.changeEntries || [];
                            
                            files = changes
                                .filter(change => change.item && change.item.path && !change.item.isFolder)
                                .map(change => ({
                                    filename: change.item.path,
                                    status: change.changeType?.toLowerCase() || 'modified',
                                    additions: 0,
                                    deletions: 0,
                                    changes: 0,
                                    objectId: change.item.objectId,
                                    url: change.item.url
                                }));
                            
                            console.log(`[DEBUG] Fetched ${files.length} files from Azure PR #${pullRequestNumber} (Latest iteration #${latestIteration.id})`);
                        } else {
                            console.warn(`Azure changes API error: ${changesResponse.statusText}`);
                        }
                    }
                } else {
                    console.warn(`Azure iterations API error: ${iterationsResponse.statusText}`);
                }
            } catch (err) {
                console.error(`Azure PR files error: ${err.message}`);
                files = [];
            }
        }

        console.log(`[DEBUG] Found ${files.length} changed files in PR #${pullRequestNumber} from repo: ${repository.name}`);

        res.status(200).json({
            success: true,
            data: {
                files,
                totalFiles: files.length,
                totalAdditions: files.reduce((sum, f) => sum + (f.additions || 0), 0),
                totalDeletions: files.reduce((sum, f) => sum + (f.deletions || 0), 0)
            },
            message: `Retrieved ${files.length} files from PR #${pullRequestNumber}`,
            debug: {
                provider: repository.provider,
                pullRequestNumber,
                fetchedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('[DEBUG] Error fetching PR files:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch pull request files'
        });
    }
};
