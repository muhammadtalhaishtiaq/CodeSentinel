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
    // OAuth fields (for GitHub, Azure, Bitbucket OAuth)
    accessToken: {
        type: String,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    },
    expiresAt: {
        type: Date,
        default: null
    },
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
    // Legacy fields (backward compatibility for manual token entry)
    githubToken: {
        type: String,
        default: null
    },
    bitbucketUsername: {
        type: String,
        default: null
    },
    bitbucketToken: {
        type: String,
        default: null
    },
    // Azure DevOps PAT fields (manual token entry)
    azureOrganization: {
        type: String,
        default: null
    },
    azurePat: {
        type: String,
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