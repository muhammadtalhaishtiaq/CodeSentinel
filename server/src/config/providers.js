/**
 * Provider Endpoint Configuration
 * All LLM provider endpoints and their configurations
 * Can be overridden by environment variables
 */

const providers = {
    aiml: {
        name: 'AIML (Shared)',
        endpoint: process.env.AIML_ENDPOINT || 'https://api.aimlapi.com/v1/chat/completions',
        model: process.env.AIML_MODEL || 'gpt-4o-mini',
        requiresApiKey: false, // Shared tier
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        })
    },

    openai: {
        name: 'OpenAI',
        endpoint: process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        requiresApiKey: true,
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        })
    },

    claude: {
        name: 'Anthropic Claude',
        endpoint: process.env.CLAUDE_ENDPOINT || 'https://api.anthropic.com/v1/messages',
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
        requiresApiKey: true,
        headers: (apiKey) => ({
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
        })
    },

    gemini: {
        name: 'Google Gemini',
        endpoint: process.env.GEMINI_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models',
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        requiresApiKey: true,
        headers: (apiKey) => ({
            'Content-Type': 'application/json'
        })
    },

    azure: {
        name: 'Microsoft Azure OpenAI',
        endpoint: process.env.AZURE_ENDPOINT || null,
        model: process.env.AZURE_MODEL || null,
        requiresApiKey: true,
        requiresEndpoint: true,
        headers: (apiKey) => ({
            'api-key': apiKey,
            'Content-Type': 'application/json'
        })
    }
};

/**
 * Get provider configuration
 * @param {string} provider - Provider name (aiml, openai, claude, gemini, azure)
 * @returns {object} Provider configuration
 */
const getProviderConfig = (provider) => {
    const config = providers[provider?.toLowerCase()];
    if (!config) {
        throw new Error(`Unknown provider: ${provider}`);
    }
    return config;
};

/**
 * Get endpoint for a provider
 * @param {string} provider - Provider name
 * @param {string} customEndpoint - Optional custom endpoint (overrides config)
 * @returns {string} API endpoint URL
 */
const getEndpoint = (provider, customEndpoint) => {
    if (customEndpoint) return customEndpoint;
    const config = getProviderConfig(provider);
    if (!config.endpoint) {
        throw new Error(`No endpoint configured for ${provider}. Please set in environment variables.`);
    }
    return config.endpoint;
};

/**
 * Get model name for a provider
 * @param {string} provider - Provider name
 * @param {string} customModel - Optional custom model (overrides config)
 * @returns {string} Model name
 */
const getModel = (provider, customModel) => {
    if (customModel) return customModel;
    const config = getProviderConfig(provider);
    if (!config.model) {
        throw new Error(`No model configured for ${provider}. Please set in environment variables.`);
    }
    return config.model;
};

/**
 * Get headers for a provider
 * @param {string} provider - Provider name
 * @param {string} apiKey - API key for authentication
 * @returns {object} Headers object
 */
const getHeaders = (provider, apiKey) => {
    const config = getProviderConfig(provider);
    return config.headers(apiKey);
};

module.exports = {
    providers,
    getProviderConfig,
    getEndpoint,
    getModel,
    getHeaders
};
