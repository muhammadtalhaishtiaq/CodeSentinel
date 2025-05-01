const axios = require('axios');

// @desc    Analyze chat message with LLM
// @route   N/A
// @access  Private
exports.analyzeWithLLM = async({ content, project, scan }) => {
    // try {
    // Check if API key is set
    if (!process.env.AIMLAPI_KEY) {
        console.error('[ERROR] AIMLAPI_KEY environment variable is not set');
        return 'I apologize, but the AI service is currently unavailable. Please try again later.';
    }

    // Prepare the context for the LLM
    const context = {
        projectName: project.name,
        scanStatus: scan ? scan.status : 'none',
        vulnerabilities: scan ? scan.result.vulnerabilities : [],
        summary: scan ? scan.result.summary : {}
    };

    console.log('AIMLAPI_KEY', process.env.AIMLAPI_KEY);
    // Call the LLM API
    const response = await axios({
        method: 'post',
        url: 'https://api.aimlapi.com/v1/chat/completions',
        headers: {
            'Authorization': `Bearer 0a1961ec336d4c14bb852f50b54fe191`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
        },
        data: {
            model: 'claude-3-7-sonnet-20250219',
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

                                Remember to:
                                - Keep responses focused on high-level security concepts
                                - Explain security principles and best practices
                                - Only provide specific code changes when explicitly asked
                                - Help users understand the reasoning behind security recommendations
                                - Keep the response summarized
                                - Dont add any extra information like "Here is the response from the LLM" or anything like that`
                }

            ],
            temperature: 0.7,
            max_tokens: 1000
        }
    });

    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        throw new Error('Invalid response format from LLM API');
    }

    return response.data.choices[0].message.content;
    // } catch (error) {
    //     console.error('Error analyzing with LLM:', error);
    //     if (error.response) {
    //         console.error('API Response:', error.response.data);
    //     }
    //     return 'I apologize, but I encountered an error while analyzing your request. Please try again later.';
    // }
};