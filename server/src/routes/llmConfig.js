const express = require('express');
const router = express.Router();
const LLMConfig = require('../models/LLMConfig');
const LLMAdapter = require('../utils/llmAdapter');
const { protect } = require('../middleware/auth');

/**
 * All routes require authentication
 */
router.use(protect);

/**
 * @route   GET /api/llm-config
 * @desc    Get all LLM configs for the current user
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
        const configs = await LLMConfig.find({ userId: req.user.id })
            .select('-encryptedApiKey') // Don't send encrypted key to frontend
            .sort({ isDefault: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: configs.length,
            data: configs
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   GET /api/llm-config/check
 * @desc    Check if user has any active LLM config
 * @access  Private
 */
router.get('/check', async (req, res) => {
    try {
        const config = await LLMConfig.findOne({
            userId: req.user.id,
            isActive: true
        });

        res.status(200).json({
            success: true,
            data: {
                hasConfig: !!config,
                provider: config ? config.provider : null
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
            data: { hasConfig: false }
        });
    }
});

/**
 * @route   GET /api/llm-config/:id
 * @desc    Get a specific LLM config by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
    try {
        const config = await LLMConfig.findById(req.params.id);

        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'LLM config not found'
            });
        }

        // Verify ownership
        if (config.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this config'
            });
        }

        // Don't send encrypted key
        config.encryptedApiKey = undefined;

        res.status(200).json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/llm-config
 * @desc    Create a new LLM config
 * @access  Private
 */
router.post('/', async (req, res) => {
    try {
        const { provider, apiKey, model, endpoint, displayName, isDefault } = req.body;

        // Validate required fields
        if (!provider) {
            return res.status(400).json({
                success: false,
                error: 'Provider is required'
            });
        }

        // Validate provider
        const validProviders = ['aiml', 'openai', 'claude', 'gemini', 'azure', 'custom'];
        if (!validProviders.includes(provider.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: `Invalid provider. Must be one of: ${validProviders.join(', ')}`
            });
        }

        // Check if API key is provided for non-AIML providers
        if (provider.toLowerCase() !== 'aiml' && !apiKey) {
            return res.status(400).json({
                success: false,
                error: `API key is required for ${provider} provider`
            });
        }

        // Check limit: max 5 configs per user
        const existingConfigs = await LLMConfig.countDocuments({ userId: req.user.id });
        if (existingConfigs >= 5) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 5 LLM configurations allowed'
            });
        }

        // Create config
        const config = await LLMConfig.create({
            userId: req.user.id,
            provider: provider.toLowerCase(),
            apiKey: provider.toLowerCase() === 'aiml' ? null : apiKey,
            model: model || null,
            endpoint: endpoint || null,
            displayName: displayName || `${provider} Config`,
            isDefault: isDefault || false
        });

        // If setting as default, unset other defaults
        if (isDefault) {
            await LLMConfig.updateMany(
                { userId: req.user.id, _id: { $ne: config._id } },
                { isDefault: false }
            );
        }

        // Test connection
        const adapter = new LLMAdapter(config);
        const isValid = await adapter.validateConnection();

        config.lastTestStatus = isValid ? 'success' : 'error';
        await config.save();

        res.status(201).json({
            success: true,
            data: config,
            connectionValid: isValid
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/llm-config/:id
 * @desc    Update an LLM config
 * @access  Private
 */
router.put('/:id', async (req, res) => {
    try {
        let config = await LLMConfig.findById(req.params.id);

        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'LLM config not found'
            });
        }

        // Verify ownership
        if (config.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this config'
            });
        }

        const { apiKey, model, endpoint, displayName, isActive, isDefault } = req.body;

        // Update allowed fields
        if (apiKey) config.apiKey = apiKey;
        if (model) config.model = model;
        if (endpoint) config.endpoint = endpoint;
        if (displayName) config.displayName = displayName;
        if (isActive !== undefined) config.isActive = isActive;

        if (isDefault && !config.isDefault) {
            // Unset other defaults
            await LLMConfig.updateMany(
                { userId: req.user.id, _id: { $ne: config._id } },
                { isDefault: false }
            );
            config.isDefault = true;
        }

        config = await config.save();

        res.status(200).json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/llm-config/:id
 * @desc    Delete an LLM config
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
    try {
        const config = await LLMConfig.findById(req.params.id);

        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'LLM config not found'
            });
        }

        // Verify ownership
        if (config.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this config'
            });
        }

        // Check if it's the default
        if (config.isDefault) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete the default LLM configuration'
            });
        }

        await LLMConfig.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/llm-config/:id/test
 * @desc    Test connection to LLM provider
 * @access  Private
 */
router.post('/:id/test', async (req, res) => {
    try {
        const config = await LLMConfig.findById(req.params.id);

        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'LLM config not found'
            });
        }

        // Verify ownership
        if (config.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to test this config'
            });
        }

        const isValid = await config.testConnection();

        res.status(200).json({
            success: true,
            data: {
                isValid,
                lastTestedAt: config.lastTestedAt,
                lastTestStatus: config.lastTestStatus,
                lastTestError: config.lastTestError
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/llm-config/:id/set-default
 * @desc    Set an LLM config as default
 * @access  Private
 */
router.post('/:id/set-default', async (req, res) => {
    try {
        const config = await LLMConfig.findById(req.params.id);

        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'LLM config not found'
            });
        }

        // Verify ownership
        if (config.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to modify this config'
            });
        }

        // Unset all other defaults
        await LLMConfig.updateMany(
            { userId: req.user.id, _id: { $ne: config._id } },
            { isDefault: false }
        );

        config.isDefault = true;
        await config.save();

        res.status(200).json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   GET /api/llm-config/providers/info
 * @desc    Get info about available providers
 * @access  Private
 */
router.get('/providers/info', (req, res) => {
    const providers = ['aiml', 'openai', 'claude', 'gemini', 'azure'];
    const info = {};

    providers.forEach(provider => {
        info[provider] = LLMAdapter.getProviderInfo(provider);
    });

    res.status(200).json({
        success: true,
        data: info
    });
});

/**
 * @route   GET /api/llm-config/default
 * @desc    Get the default LLM config for current user
 * @access  Private
 */
router.get('/default/get', async (req, res) => {
    try {
        let config = await LLMConfig.findOne({
            userId: req.user.id,
            isDefault: true
        });

        // Fallback to AIML if no default set
        if (!config) {
            const aimlConfig = await LLMConfig.findOne({
                userId: req.user.id,
                provider: 'aiml'
            });

            if (!aimlConfig) {
                // Create default AIML config if doesn't exist
                config = await LLMConfig.create({
                    userId: req.user.id,
                    provider: 'aiml',
                    displayName: 'AIML (Shared)',
                    isDefault: true,
                    isActive: true
                });
            } else {
                config = aimlConfig;
            }
        }

        res.status(200).json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
