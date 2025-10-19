const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a project name'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    repository: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository'
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    scanHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scan'
    }],
    latestScan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scan'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active'
    },
    summary: {
        totalScans: {
            type: Number,
            default: 0
        },
        lastScanDate: Date,
        vulnerabilityCounts: {
            low: { type: Number, default: 0 },
            medium: { type: Number, default: 0 },
            high: { type: Number, default: 0 },
            critical: { type: Number, default: 0 }
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // Chat-related fields
    chatSettings: {
        enabled: {
            type: Boolean,
            default: true
        },
        model: {
            type: String,
            enum: ['claude-3-7-sonnet', 'gpt-4'],
            default: 'claude-3-7-sonnet'
        },
        temperature: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.7
        },
        maxTokens: {
            type: Number,
            min: 100,
            max: 4000,
            default: 2000
        }
    },
    lastChatActivity: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
ProjectSchema.index({ user: 1, status: 1 });
ProjectSchema.index({ 'chatSettings.enabled': 1 });
ProjectSchema.index({ lastChatActivity: 1 });

// Virtual for chat status
ProjectSchema.virtual('chatStatus').get(function() {
    if (!this.chatSettings.enabled) return 'disabled';
    if (!this.lastChatActivity) return 'never_used';
    const daysSinceLastActivity = Math.floor((Date.now() - this.lastChatActivity) / (1000 * 60 * 60 * 24));
    if (daysSinceLastActivity > 30) return 'inactive';
    return 'active';
});

// Pre-save middleware to update lastChatActivity
ProjectSchema.pre('save', function(next) {
    if (this.isModified('chatSettings') && this.chatSettings.enabled) {
        this.lastChatActivity = new Date();
    }
    next();
});

// Update timestamps
ProjectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Update project summary when a new scan is added
ProjectSchema.methods.updateSummary = async function(scan) {
    this.summary.totalScans += 1;
    this.summary.lastScanDate = scan.completedAt || Date.now();

    // Only update vulnerability counts if scan has results
    if (scan.result && scan.result.summary) {
        this.summary.vulnerabilityCounts.low = scan.result.summary.lowCount || 0;
        this.summary.vulnerabilityCounts.medium = scan.result.summary.mediumCount || 0;
        this.summary.vulnerabilityCounts.high = scan.result.summary.highCount || 0;
        this.summary.vulnerabilityCounts.critical = scan.result.summary.criticalCount || 0;
    }

    this.latestScan = scan._id;
    this.scanHistory.push(scan._id);

    return this.save();
};

module.exports = mongoose.model('Project', ProjectSchema);