const SourceCredential = require('../models/SourceCredential');
const { decrypt } = require('./encryption');
const fetch = require('node-fetch');

/**
 * GitHub API Utility Functions
 * Handles all GitHub API interactions using OAuth tokens
 */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Get decrypted GitHub token for a user
 * @param {string} userId - MongoDB User ID
 * @returns {Promise<string|null>} Decrypted access token or null
 */
const getGitHubToken = async (userId) => {
    try {
        const credential = await SourceCredential.findOne({
            user: userId,
            provider: 'github',
            isActive: true
        });

        if (!credential || !credential.githubToken) {
            console.log('[GitHub] No active GitHub credentials found for user:', userId);
            return null;
        }

        // Check if token is expired (for OAuth tokens with expiry)
        if (credential.githubTokenExpiresAt && credential.githubTokenExpiresAt < new Date()) {
            console.warn('[GitHub] Token expired for user:', userId);
            // TODO: Implement token refresh logic here
            return null;
        }

        // Decrypt token
        let token = credential.githubToken;
        if (credential.authType === 'oauth') {
            token = decrypt(token);
        }

        return token;
    } catch (error) {
        console.error('[GitHub] Error getting token:', error);
        return null;
    }
};

/**
 * Get GitHub user info
 * @param {string} userId - MongoDB User ID
 * @returns {Promise<Object|null>} GitHub user info
 */
const getGitHubUser = async (userId) => {
    const token = await getGitHubToken(userId);
    if (!token) return null;

    try {
        const response = await fetch(`${GITHUB_API_BASE}/user`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            console.error('[GitHub] Failed to fetch user:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('[GitHub] Error fetching user:', error);
        return null;
    }
};

/**
 * Get all repositories for authenticated user
 * @param {string} userId - MongoDB User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of repositories
 */
const getUserRepositories = async (userId, options = {}) => {
    const token = await getGitHubToken(userId);
    if (!token) return [];

    try {
        const params = new URLSearchParams({
            per_page: options.perPage || 100,
            sort: options.sort || 'updated',
            direction: options.direction || 'desc',
            type: options.type || 'all' // all, owner, public, private, member
        });

        const response = await fetch(`${GITHUB_API_BASE}/user/repos?${params}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            console.error('[GitHub] Failed to fetch repos:', response.status);
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error('[GitHub] Error fetching repos:', error);
        return [];
    }
};

/**
 * Get pull requests for a specific repository
 * @param {string} userId - MongoDB User ID
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of pull requests
 */
const getRepositoryPullRequests = async (userId, owner, repo, options = {}) => {
    const token = await getGitHubToken(userId);
    if (!token) return [];

    try {
        const params = new URLSearchParams({
            state: options.state || 'open', // open, closed, all
            sort: options.sort || 'created',
            direction: options.direction || 'desc',
            per_page: options.perPage || 30
        });

        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?${params}`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!response.ok) {
            console.error('[GitHub] Failed to fetch PRs:', response.status);
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error('[GitHub] Error fetching PRs:', error);
        return [];
    }
};

/**
 * Get details of a specific pull request
 * @param {string} userId - MongoDB User ID
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} prNumber - Pull request number
 * @returns {Promise<Object|null>} Pull request details
 */
const getPullRequestDetails = async (userId, owner, repo, prNumber) => {
    const token = await getGitHubToken(userId);
    if (!token) return null;

    try {
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!response.ok) {
            console.error('[GitHub] Failed to fetch PR details:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('[GitHub] Error fetching PR details:', error);
        return null;
    }
};

/**
 * Get files changed in a pull request
 * @param {string} userId - MongoDB User ID
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} prNumber - Pull request number
 * @returns {Promise<Array>} List of changed files
 */
const getPullRequestFiles = async (userId, owner, repo, prNumber) => {
    const token = await getGitHubToken(userId);
    if (!token) return [];

    try {
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}/files`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!response.ok) {
            console.error('[GitHub] Failed to fetch PR files:', response.status);
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error('[GitHub] Error fetching PR files:', error);
        return [];
    }
};

/**
 * Get diff/patch content for a pull request
 * @param {string} userId - MongoDB User ID
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} prNumber - Pull request number
 * @returns {Promise<string|null>} Diff content
 */
const getPullRequestDiff = async (userId, owner, repo, prNumber) => {
    const token = await getGitHubToken(userId);
    if (!token) return null;

    try {
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3.diff' // Get diff format
                }
            }
        );

        if (!response.ok) {
            console.error('[GitHub] Failed to fetch PR diff:', response.status);
            return null;
        }

        return await response.text();
    } catch (error) {
        console.error('[GitHub] Error fetching PR diff:', error);
        return null;
    }
};

/**
 * Get commits in a pull request
 * @param {string} userId - MongoDB User ID
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} prNumber - Pull request number
 * @returns {Promise<Array>} List of commits
 */
const getPullRequestCommits = async (userId, owner, repo, prNumber) => {
    const token = await getGitHubToken(userId);
    if (!token) return [];

    try {
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}/commits`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!response.ok) {
            console.error('[GitHub] Failed to fetch PR commits:', response.status);
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error('[GitHub] Error fetching PR commits:', error);
        return [];
    }
};

/**
 * Get all pull requests across all user's repositories
 * Useful for dashboard showing all PRs user is involved in
 * @param {string} userId - MongoDB User ID
 * @returns {Promise<Array>} List of pull requests with repo info
 */
const getAllUserPullRequests = async (userId) => {
    try {
        // First get all repositories
        const repos = await getUserRepositories(userId);
        
        if (!repos || repos.length === 0) {
            console.log('[GitHub] No repositories found for user');
            return [];
        }

        console.log(`[GitHub] Fetching PRs from ${repos.length} repositories...`);

        // Fetch PRs from each repository
        const allPRs = [];
        
        for (const repo of repos) {
            const [owner, repoName] = repo.full_name.split('/');
            const prs = await getRepositoryPullRequests(userId, owner, repoName);
            
            // Add repository context to each PR
            prs.forEach(pr => {
                allPRs.push({
                    ...pr,
                    repository: {
                        name: repo.name,
                        full_name: repo.full_name,
                        private: repo.private,
                        html_url: repo.html_url
                    }
                });
            });
        }

        console.log(`[GitHub] Found ${allPRs.length} total PRs across all repos`);
        return allPRs;

    } catch (error) {
        console.error('[GitHub] Error fetching all user PRs:', error);
        return [];
    }
};

module.exports = {
    getGitHubToken,
    getGitHubUser,
    getUserRepositories,
    getRepositoryPullRequests,
    getPullRequestDetails,
    getPullRequestFiles,
    getPullRequestDiff,
    getPullRequestCommits,
    getAllUserPullRequests
};

