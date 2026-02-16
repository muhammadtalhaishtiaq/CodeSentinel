const axios = require('axios');
const LLMConfig = require('../models/LLMConfig');
const LLMAdapter = require('./llmAdapter');

// @desc    Get the active LLM config for a user (or use shared AIML)
// @route   N/A
// @access  Private
const getActiveLLMConfig = async (userId) => {
    try {
        // Try to find user's default LLM config
        let config = await LLMConfig.findOne({
            userId,
            isDefault: true,
            isActive: true
        });

        // Fallback to AIML if no default found
        if (!config) {
            config = await LLMConfig.findOne({
                userId,
                provider: 'aiml'
            });
        }

        // Create default AIML config if doesn't exist
        if (!config) {
            config = await LLMConfig.create({
                userId,
                provider: 'aiml',
                displayName: 'AIML (Shared)',
                isDefault: true,
                isActive: true
            });
        }

        return config;
    } catch (error) {
        console.error('Error getting LLM config:', error.message);
        // Return null to trigger fallback
        return null;
    }
};

// @desc    Analyze chat message with LLM
// @route   N/A
// @access  Private
exports.analyzeWithLLM = async ({ content, project, scan, userId }) => {
    try {
        // Get user's LLM config
        let config = await getActiveLLMConfig(userId);

        // Fallback to AIML if config retrieval fails
        if (!config) {
            return await exports.analyzeWithAIML(content, project, scan);
        }

        // Prepare the context for the LLM
        const context = {
            projectName: project.name,
            scanStatus: scan ? scan.status : 'none',
            vulnerabilities: scan ? scan.result.vulnerabilities : [],
            summary: scan ? scan.result.summary : {}
        };

        const systemPrompt = `You are a security expert assistant. Your role is to:
1. Provide high-level security analysis and recommendations
2. Explain security concepts and best practices
3. Discuss potential security risks and their implications
4. Suggest general security improvements
5. Only provide specific code changes when explicitly requested
6. Focus on explaining the "why" behind security recommendations
7. Help users understand security concepts rather than just providing solutions`;

        const userMessage = `Current project context:
Project: ${context.projectName}
Scan Status: ${context.scanStatus}
Total Vulnerabilities: ${context.summary.total || 0}
Critical: ${context.summary.criticalCount || 0}
High: ${context.summary.highCount || 0}
Medium: ${context.summary.mediumCount || 0}
Low: ${context.summary.lowCount || 0}

User message: ${content}

Remember to:
- Keep responses focused on high-level security concepts
- Explain security principles and best practices
- Only provide specific code changes when explicitly asked
- Help users understand the reasoning behind security recommendations
- Keep the response summarized`;

        // Use LLM Adapter to generate completion
        const adapter = new LLMAdapter(config);
        const result = await adapter.generateCompletion(userMessage, {
            systemPrompt,
            temperature: 0.7,
            maxTokens: 1000
        });

        return result.response;
    } catch (error) {
        console.error('Error analyzing with LLM:', error.message);
        // Fallback to basic AIML response
        return await exports.analyzeWithAIML(content, project, scan);
    }
};

// @desc    Fallback: Analyze with shared AIML API directly
// @route   N/A
// @access  Private
exports.analyzeWithAIML = async (content, project, scan) => {
    try {
        // Check if shared API key is set
        if (!process.env.AIML_API_KEY) {
            console.error('[ERROR] AIML_API_KEY environment variable is not set');
            return 'I apologize, but the AI service is currently unavailable. Please try again later.';
        }

        // Prepare the context for the LLM
        const context = {
            projectName: project.name,
            scanStatus: scan ? scan.status : 'none',
            vulnerabilities: scan ? scan.result.vulnerabilities : [],
            summary: scan ? scan.result.summary : {}
        };

        // Call the shared AIML API directly
        const response = await axios({
            method: 'post',
            url: 'https://api.aiml.ai/v1/chat/completions',
            headers: {
                'Authorization': `Bearer ${process.env.AIML_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                model: 'AIML/model',
                messages: [{
                    role: 'user',
                    content: `You are a security expert assistant. Your role is to:
1. Provide high-level security analysis and recommendations
2. Explain security concepts and best practices
3. Discuss potential security risks and their implications
4. Suggest general security improvements
5. Only provide specific code changes when explicitly requested by the user
6. Focus on explaining the "why" behind security recommendations
7. Help users understand security concepts rather than just providing solutions

Current project context:
Project: ${context.projectName}
Scan Status: ${context.scanStatus}
Total Vulnerabilities: ${context.summary.total || 0}
Critical: ${context.summary.criticalCount || 0}
High: ${context.summary.highCount || 0}
Medium: ${context.summary.mediumCount || 0}
Low: ${context.summary.lowCount || 0}

User message: ${content}

Remember to:
- Keep responses focused on high-level security concepts
- Explain security principles and best practices
- Only provide specific code changes when explicitly asked
- Help users understand the reasoning behind security recommendations
- Keep the response summarized`
                }],
                temperature: 0.7,
                max_tokens: 1000
            },
            timeout: 30000
        });

        if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
            throw new Error('Invalid response format from AIML API');
        }

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error analyzing with AIML:', error.message);
        if (error.response) {
            console.error('API Response status:', error.response.status);
        }
        return 'I apologize, but I encountered an error while analyzing your request. Please try again later.';
    }
};