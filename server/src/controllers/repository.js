const SourceCredential = require('../models/SourceCredential');
const { decrypt } = require('../utils/encryption');
const fetch = require('node-fetch');

/**
 * Repository Controller
 * Handles repository operations for ALL providers (GitHub, Bitbucket, Azure)
 */

/**
 * Get branches and pull requests for a repository
 * Works for any provider
 * @route GET /api/repositories/:repoId/refs
 * @access Private
 */
exports.getRepositoryRefs = async (req, res, next) => {
    try {
        const { repoId } = req.params;
        const { type } = req.query; // 'branches', 'prs', or 'all'
        
        console.log(`[Repo] Fetching refs for repository: ${repoId}, type: ${type || 'all'}`);
        
        // Get the repository from DB
        const Repository = require('../models/Repository');
        const repository = await Repository.findById(repoId);
        
        if (!repository) {
            return res.status(404).json({
                success: false,
                message: 'Repository not found'
            });
        }
        
        // Get user's credentials for this provider
        const credential = await SourceCredential.findOne({
            user: req.user._id,
            provider: repository.provider,
            isActive: true
        });
        
        if (!credential) {
            return res.status(404).json({
                success: false,
                message: `No active ${repository.provider} credentials found`
            });
        }
        
        // Get decrypted token
        let token = credential.githubToken || credential.bitbucketToken;
        if (credential.authType === 'oauth' && token) {
            token = decrypt(token);
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No valid authentication token found'
            });
        }
        
        const result = {
            branches: [],
            pullRequests: []
        };
        
        // Fetch based on provider
        if (repository.provider === 'github') {
            // Fetch branches
            if (!type || type === 'branches' || type === 'all') {
                const branchesResponse = await fetch(
                    `https://api.github.com/repos/${repository.name}/branches`,
                    {
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                if (branchesResponse.ok) {
                    const branches = await branchesResponse.json();
                    result.branches = branches.map(b => ({
                        name: b.name,
                        sha: b.commit.sha,
                        protected: b.protected || false
                    }));
                }
            }
            
            // Fetch pull requests
            if (!type || type === 'prs' || type === 'all') {
                const prsResponse = await fetch(
                    `https://api.github.com/repos/${repository.name}/pulls?state=open&per_page=50`,
                    {
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                if (prsResponse.ok) {
                    const prs = await prsResponse.json();
                    result.pullRequests = prs.map(pr => ({
                        number: pr.number,
                        title: pr.title,
                        branch: pr.head.ref,
                        baseBranch: pr.base.ref,
                        author: pr.user.login,
                        createdAt: pr.created_at,
                        updatedAt: pr.updated_at,
                        url: pr.html_url
                    }));
                }
            }
        } else if (repository.provider === 'bitbucket') {
            // Bitbucket implementation
            const [owner, repoSlug] = repository.name.split('/');
            
            // Fetch branches
            if (!type || type === 'branches' || type === 'all') {
                const branchesResponse = await fetch(
                    `https://api.bitbucket.org/2.0/repositories/${owner}/${repoSlug}/refs/branches`,
                    {
                        headers: {
                            'Authorization': `Basic ${Buffer.from(`${credential.bitbucketUsername}:${token}`).toString('base64')}`,
                            'Accept': 'application/json'
                        }
                    }
                );
                
                if (branchesResponse.ok) {
                    const data = await branchesResponse.json();
                    result.branches = (data.values || []).map(b => ({
                        name: b.name,
                        sha: b.target.hash,
                        protected: false
                    }));
                }
            }
            
            // Fetch pull requests
            if (!type || type === 'prs' || type === 'all') {
                const prsResponse = await fetch(
                    `https://api.bitbucket.org/2.0/repositories/${owner}/${repoSlug}/pullrequests?state=OPEN`,
                    {
                        headers: {
                            'Authorization': `Basic ${Buffer.from(`${credential.bitbucketUsername}:${token}`).toString('base64')}`,
                            'Accept': 'application/json'
                        }
                    }
                );
                
                if (prsResponse.ok) {
                    const data = await prsResponse.json();
                    result.pullRequests = (data.values || []).map(pr => ({
                        number: pr.id,
                        title: pr.title,
                        branch: pr.source.branch.name,
                        baseBranch: pr.destination.branch.name,
                        author: pr.author.display_name,
                        createdAt: pr.created_on,
                        updatedAt: pr.updated_on,
                        url: pr.links.html.href
                    }));
                }
            }
        }
        
        console.log(`[Repo] Found ${result.branches.length} branches and ${result.pullRequests.length} PRs`);
        
        res.status(200).json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('[Repo] Error fetching repository refs:', error);
        next(error);
    }
};

module.exports = exports;

