const mongoose = require('mongoose');

const SourceCredentialSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: String,
        enum: ['github', 'bitbucket', 'azure'],
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // OAuth metadata
    authType: {
        type: String,
        enum: ['manual', 'oauth'],
        default: 'manual'
    },
    // Provider user info (for OAuth)
    providerUserId: {
        type: String,
        default: null
    },
    providerUsername: {
        type: String,
        default: null
    },
    providerEmail: {
        type: String,
        default: null
    },
    // GitHub fields (encrypted when OAuth)
    githubToken: {
        type: String,
        default: null
    },
    githubRefreshToken: {
        type: String,
        default: null
    },
    githubTokenExpiresAt: {
        type: Date,
        default: null
    },
    // Bitbucket fields
    bitbucketUsername: {
        type: String,
        default: null
    },
    bitbucketToken: {
        type: String,
        default: null
    },
    bitbucketRefreshToken: {
        type: String,
        default: null
    },
    // Azure DevOps fields
    azureToken: {
        type: String,
        default: null
    },
    azureRefreshToken: {
        type: String,
        default: null
    },
    azureTokenExpiresAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to update 'updatedAt' timestamp
SourceCredentialSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Only one default provider can exist per user
SourceCredentialSchema.pre('save', async function(next) {
    if (this.isDefault) {
        // Find any existing default providers for this user and unset them
        await this.constructor.updateMany({ user: this.user, _id: { $ne: this._id }, isDefault: true }, { $set: { isDefault: false } });
    }
    next();
});

module.exports = mongoose.model('SourceCredential', SourceCredentialSchema);