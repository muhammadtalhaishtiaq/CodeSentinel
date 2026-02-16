/**
 * LLM Adapter - Unified interface for multiple LLM providers
 * Handles: OpenAI, Anthropic Claude, Google Gemini, Azure OpenAI, AIML (shared)
 */

const axios = require('axios');
const { getEndpoint, getHeaders, getModel } = require('../config/providers');

class LLMAdapter {
    constructor(llmConfig) {
        this.config = llmConfig;
        this.provider = llmConfig.provider.toLowerCase();
        this.model = llmConfig.model;
        this.endpoint = llmConfig.endpoint;
    }

    /**
     * Send chat/generation request to LLM
     * @param {string} prompt - The prompt to send
     * @param {object} options - Additional options (temperature, maxTokens, etc)
     * @returns {Promise<{response: string, tokensUsed: number, cost: number}>}
     */
    async generateCompletion(prompt, options = {}) {
        const {
            temperature = 0.7,
            maxTokens = 2000,
            systemPrompt = null,
            retries = 3
        } = options;

        let lastError;
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const result = await this._callProvider(
                    prompt,
                    systemPrompt,
                    temperature,
                    maxTokens
                );

                // Record usage
                if (this.config && typeof this.config.recordUsage === 'function') {
                    this.config.recordUsage(result.tokensUsed, result.cost);
                    await this.config.save();
                }

                return result;
            } catch (error) {
                lastError = error;
                if (attempt < retries - 1) {
                    // Exponential backoff
                    await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
                }
            }
        }

        throw lastError;
    }

    /**
     * Generate code/fix suggestions
     */
    async generateFix(vulnerability, codeContext, options = {}) {
        const systemPrompt = `You are a security expert. Generate a secure fix for the vulnerability in the provided code context.
        
Format your response as:
1. Explanation (1-2 sentences)
2. Fixed code (in a code block)
3. Why this works (1 sentence)`;

        const prompt = `Vulnerability: ${vulnerability}

Context:
\`\`\`
${codeContext}
\`\`\`

Generate a secure fix.`;

        return this.generateCompletion(prompt, {
            ...options,
            systemPrompt,
            temperature: 0.2, // Lower temp for fixes (more deterministic)
            maxTokens: 1500
        });
    }

    /**
     * Validate connection to provider
     */
    async validateConnection() {
        try {
            if (this.provider === 'aiml') {
                // AIML is always available
                return true;
            }

            const apiKey = this.config.getDecryptedApiKey();
            if (!apiKey) {
                return false;
            }

            // Send a minimal test request
            const testPrompt = 'Say "ok" in one word.';
            const result = await this.generateCompletion(testPrompt, {
                maxTokens: 10
            });

            return !!result.response;
        } catch (error) {
            console.error(`Connection validation failed for ${this.provider}:`, error.message);
            return false;
        }
    }

    /**
     * Internal method: Call the appropriate provider
     */
    async _callProvider(prompt, systemPrompt, temperature, maxTokens) {
        switch (this.provider) {
            case 'openai':
                return this._callOpenAI(prompt, systemPrompt, temperature, maxTokens);
            case 'claude':
                return this._callClaude(prompt, systemPrompt, temperature, maxTokens);
            case 'gemini':
                return this._callGemini(prompt, systemPrompt, temperature, maxTokens);
            case 'azure':
                return this._callAzure(prompt, systemPrompt, temperature, maxTokens);
            case 'aiml':
            default:
                return this._callAIML(prompt, systemPrompt, temperature, maxTokens);
        }
    }

    /**
     * OpenAI API call (GPT-4, GPT-3.5-turbo)
     */
    async _callOpenAI(prompt, systemPrompt, temperature, maxTokens) {
        const apiKey = this.config.getDecryptedApiKey();
        const model = this.model || 'gpt-4o-mini';

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model,
                messages: [
                    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                    { role: 'user', content: prompt }
                ],
                temperature,
                max_tokens: maxTokens
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const content = response.data.choices[0].message.content;
        const tokensUsed = response.data.usage.total_tokens;
        const cost = this._calculateOpenAICost(model, response.data.usage);

        return { response: content, tokensUsed, cost };
    }

    /**
     * Anthropic Claude API call
     */
    async _callClaude(prompt, systemPrompt, temperature, maxTokens) {
        const apiKey = this.config.getDecryptedApiKey();
        const model = this.model || 'claude-3-5-sonnet-20241022';

        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model,
                max_tokens: maxTokens,
                temperature,
                ...(systemPrompt && { system: systemPrompt }),
                messages: [
                    { role: 'user', content: prompt }
                ]
            },
            {
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                timeout: 30000
            }
        );

        const content = response.data.content[0].text;
        const tokensUsed = response.data.usage.input_tokens + response.data.usage.output_tokens;
        const cost = this._calculateClaudeCost(model, response.data.usage);

        return { response: content, tokensUsed, cost };
    }

    /**
     * Google Gemini API call
     */
    async _callGemini(prompt, systemPrompt, temperature, maxTokens) {
        const apiKey = this.config.getDecryptedApiKey();
        const model = this.model || 'gemini-2.0-flash';

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                contents: [
                    {
                        parts: [
                            ...(systemPrompt ? [{ text: systemPrompt }] : []),
                            { text: prompt }
                        ]
                    }
                ],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const content = response.data.candidates[0].content.parts[0].text;
        const tokensUsed = response.data.usageMetadata.totalTokenCount;
        const cost = this._calculateGeminiCost(model, tokensUsed);

        return { response: content, tokensUsed, cost };
    }

    /**
     * Microsoft Azure OpenAI API call
     */
    async _callAzure(prompt, systemPrompt, temperature, maxTokens) {
        const apiKey = this.config.getDecryptedApiKey();
        const endpoint = this.endpoint;
        const deploymentId = this.model || 'gpt-4o-mini';

        if (!endpoint) {
            throw new Error('Azure endpoint is required');
        }

        const response = await axios.post(
            `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=2024-02-15-preview`,
            {
                messages: [
                    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                    { role: 'user', content: prompt }
                ],
                temperature,
                max_tokens: maxTokens
            },
            {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const content = response.data.choices[0].message.content;
        const tokensUsed = response.data.usage.total_tokens;
        const cost = this._calculateOpenAICost(deploymentId, response.data.usage);

        return { response: content, tokensUsed, cost };
    }

    /**
     * AIML (Shared/Free tier) API call
     * Using a shared key from environment
     */
    async _callAIML(prompt, systemPrompt, temperature, maxTokens) {
        let apiKey = null;
        
        // For shared AIML (no encryptedApiKey in config), use environment variable
        // For user-provided AIML key, try to decrypt it first
        if (this.config && this.config.encryptedApiKey) {
            try {
                apiKey = this.config.getDecryptedApiKey();
                console.log('[DEBUG] Using AIML API key from encrypted config');
            } catch (error) {
                console.warn('[WARN] Failed to decrypt AIML API key from config:', error.message);
            }
        } else if (this.config) {
            console.log('[DEBUG] Shared AIML config (no encryptedApiKey), using environment variable');
        }
        
        // Fallback to environment variable (for shared AIML or if decryption failed)
        if (!apiKey) {
            apiKey = process.env.AIML_API_KEY;
            if (apiKey) {
                console.log('[DEBUG] Using AIML API key from environment variable');
            }
        }
        
        if (!apiKey) {
            throw new Error('AIML_API_KEY not configured in database or environment');
        }

        // Get endpoint and model from provider configuration
        const endpoint = getEndpoint('aiml', this.config?.endpoint);
        const model = getModel('aiml', this.config?.model);
        const headers = getHeaders('aiml', apiKey);

        const response = await axios.post(
            endpoint,
            {
                model,
                messages: [
                    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                    { role: 'user', content: prompt }
                ],
                temperature,
                max_tokens: maxTokens
            },
            {
                headers,
                timeout: 30000
            }
        );

        const content = response.data.choices[0].message.content;
        const tokensUsed = response.data.usage?.total_tokens || 0;
        const cost = 0; // AIML is free for shared tier

        return { response: content, tokensUsed, cost };
    }

    /**
     * Calculate cost for OpenAI API consumption
     */
    _calculateOpenAICost(model, usage) {
        const pricing = {
            'gpt-4': { input: 0.00003, output: 0.00006 },
            'gpt-4-turbo': { input: 0.000010, output: 0.000030 },
            'gpt-4o': { input: 0.005, output: 0.015 },
            'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
            'gpt-3.5-turbo': { input: 0.0000005, output: 0.0000015 }
        };

        const rates = pricing[model] || pricing['gpt-4o-mini'];
        return (usage.prompt_tokens * rates.input + usage.completion_tokens * rates.output);
    }

    /**
     * Calculate cost for Claude API consumption
     */
    _calculateClaudeCost(model, usage) {
        const pricing = {
            'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
            'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
            'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
            'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
        };

        const rates = pricing[model] || pricing['claude-3-5-sonnet-20241022'];
        return (usage.input_tokens * rates.input + usage.output_tokens * rates.output) / 1000;
    }

    /**
     * Calculate cost for Gemini API consumption
     */
    _calculateGeminiCost(model, totalTokens) {
        // Gemini pricing: roughly $0.075 per 1M tokens for flash
        const costPer1M = 0.075;
        return (totalTokens * costPer1M) / 1000000;
    }

    /**
     * Get provider info for UI display
     */
    static getProviderInfo(provider) {
        const info = {
            'aiml': {
                name: 'AIML (Shared)',
                description: 'Free shared key - 50 scans/month',
                models: [], // No selection needed
                needsApiKey: false,
                needsEndpoint: false,
                pricing: 'Free for shared key'
            },
            'openai': {
                name: 'OpenAI',
                description: 'GPT-4, GPT-4 Turbo, GPT-3.5 Turbo',
                models: ['gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
                needsApiKey: true,
                needsEndpoint: false,
                pricing: '$0.0015 - $0.03 per 1K tokens',
                docsUrl: 'https://platform.openai.com/api-keys'
            },
            'claude': {
                name: 'Anthropic Claude',
                description: 'Claude 3 Opus, Sonnet, Haiku',
                models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
                needsApiKey: true,
                needsEndpoint: false,
                pricing: '$0.00025 - $0.015 per 1K tokens',
                docsUrl: 'https://console.anthropic.com/keys'
            },
            'gemini': {
                name: 'Google Gemini',
                description: 'Gemini 1.5 Pro, Flash',
                models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
                needsApiKey: true,
                needsEndpoint: false,
                pricing: '$0.075 per 1M tokens',
                docsUrl: 'https://console.cloud.google.com/gen-app-builder/credentials'
            },
            'azure': {
                name: 'Microsoft Azure OpenAI',
                description: 'Azure-hosted GPT models',
                models: ['gpt-4o-mini', 'gpt-4-turbo', 'gpt-4'],
                needsApiKey: true,
                needsEndpoint: true,
                pricing: 'Pay per token (varies by region)',
                docsUrl: 'https://portal.azure.com'
            }
        };

        return info[provider] || null;
    }
}

module.exports = LLMAdapter;
