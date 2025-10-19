const mongoose = require('mongoose');

const RepositorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sourceCredential: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SourceCredential',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        enum: ['github', 'bitbucket'],
        required: true
    },
    repoId: {
        type: String,
        required: true
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    lastScanDate: {
        type: Date,
        default: null
    },
    connectedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to update 'updatedAt' timestamp
RepositorySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Create a compound index to prevent duplicate repositories for a user
RepositorySchema.index({ user: 1, provider: 1, repoId: 1 }, { unique: true });

module.exports = mongoose.model('Repository', RepositorySchema);