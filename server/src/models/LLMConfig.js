const mongoose = require('mongoose');
const crypto = require('crypto');

const LLMConfigSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'LLM config must have a user'],
        index: true
    },
    provider: {
        type: String,
        enum: ['aiml', 'openai', 'claude', 'gemini', 'azure', 'custom'],
        required: [true, 'Please specify a provider'],
        lowercase: true
    },
    // For AIML (shared): no API key needed
    // For others: encrypted API key
    apiKey: {
        type: String,
        // Only required for non-AIML providers
        validate: {
            validator: function() {
                // AIML provider doesn't need API key
                if (this.provider === 'aiml') return true;
                // All others need API key
                return !!this.apiKey;
            },
            message: 'API Key is required for this provider'
        }
    },
    // Encrypted API key (stored encrypted in database)
    encryptedApiKey: {
        type: String
    },
    // Provider-specific configuration
    model: {
        type: String,
        // Standard defaults for each provider
        // OpenAI: gpt-4o-mini, gpt-4, gpt-3.5-turbo
        // Claude: claude-3.5-sonnet, claude-3-opus, claude-3-sonnet, claude-3-haiku
        // Gemini: gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash
        // Azure: model name from deployment
    },
    endpoint: {
        type: String,
        // For Azure, custom endpoints
        // Optional for standard providers
    },
    // Settings
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Metadata
    displayName: {
        type: String,
        // User-friendly name: "My OpenAI Key", "Company Claude", etc
        validate: {
            validator: function(v) {
                return !v || v.length <= 100;
            },
            message: 'Display name must be less than 100 characters'
        }
    },
    // Usage tracking
    totalRequests: {
        type: Number,
        default: 0
    },
    totalTokensUsed: {
        type: Number,
        default: 0
    },
    estimatedCost: {
        type: Number,
        default: 0
    },
    // Limits
    monthlyRequestLimit: {
        type: Number,
        // Optional limit user can set
    },
    currentMonthRequests: {
        type: Number,
        default: 0
    },
    currentMonthTokens: {
        type: Number,
        default: 0
    },
    // Status tracking
    lastUsed: {
        type: Date
    },
    lastTestedAt: {
        type: Date
    },
    lastTestStatus: {
        type: String,
        enum: ['success', 'error', 'pending'],
        default: 'pending'
    },
    lastTestError: {
        type: String
    },
    // Rate limiting
    requestsLastHour: {
        type: Number,
        default: 0
    },
    requestsLastDay: {
        type: Number,
        default: 0
    },
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure only one default config per user
LLMConfigSchema.index({ userId: 1, isDefault: 1 }, {
    sparse: true,
    unique: true,
    partialFilterExpression: { isDefault: true }
});

// Encrypt API key before saving
LLMConfigSchema.pre('save', async function(next) {
    // Only encrypt if API key is modified
    if (!this.isModified('apiKey')) {
        return next();
    }

    // Don't encrypt for AIML provider (no key)
    if (this.provider === 'aiml') {
        this.apiKey = null;
        this.encryptedApiKey = null;
        return next();
    }

    try {
        if (this.apiKey) {
            const encryptionKey = process.env.ENCRYPTION_KEY;
            if (!encryptionKey) {
                throw new Error('ENCRYPTION_KEY not set in environment');
            }

            const algorithm = 'aes-256-gcm';
            const key = crypto
                .createHash('sha256')
                .update(encryptionKey)
                .digest();
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(algorithm, key, iv);

            let encrypted = cipher.update(this.apiKey, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const authTag = cipher.getAuthTag();

            // Store as: iv:encrypted:authTag (all hex)
            this.encryptedApiKey = `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
            this.apiKey = null; // Clear plaintext
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Method to decrypt API key
LLMConfigSchema.methods.getDecryptedApiKey = function() {
    if (this.provider === 'aiml' || !this.encryptedApiKey) {
        return null;
    }

    try {
        const encryptionKey = process.env.ENCRYPTION_KEY;
        if (!encryptionKey) {
            throw new Error('ENCRYPTION_KEY not set in environment');
        }

        const algorithm = 'aes-256-gcm';
        const key = crypto
            .createHash('sha256')
            .update(encryptionKey)
            .digest();

        const [ivHex, encrypted, authTagHex] = this.encryptedApiKey.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Error decrypting API key:', error);
        return null;
    }
};

// Method to test connection
LLMConfigSchema.methods.testConnection = async function() {
    try {
        const LLMAdapter = require('../utils/llmAdapter');
        const adapter = new LLMAdapter(this);
        const isValid = await adapter.validateConnection();
        
        this.lastTestedAt = new Date();
        this.lastTestStatus = isValid ? 'success' : 'error';
        this.lastTestError = isValid ? null : 'Connection failed';
        
        await this.save();
        return isValid;
    } catch (error) {
        this.lastTestedAt = new Date();
        this.lastTestStatus = 'error';
        this.lastTestError = error.message;
        await this.save();
        return false;
    }
};

// Method to increment usage
LLMConfigSchema.methods.recordUsage = function(tokensUsed, cost = 0) {
    this.totalRequests += 1;
    this.totalTokensUsed += tokensUsed;
    this.estimatedCost += cost;
    this.currentMonthRequests += 1;
    this.currentMonthTokens += tokensUsed;
    this.requestsLastHour += 1;
    this.requestsLastDay += 1;
    this.lastUsed = new Date();
};

// Virtual for display
LLMConfigSchema.virtual('displayProvider').get(function() {
    const names = {
        'aiml': 'AIML (Shared)',
        'openai': 'OpenAI',
        'claude': 'Anthropic Claude',
        'gemini': 'Google Gemini',
        'azure': 'Microsoft Azure OpenAI',
        'custom': 'Custom Provider'
    };
    return names[this.provider] || this.provider;
});

module.exports = mongoose.model('LLMConfig', LLMConfigSchema);
