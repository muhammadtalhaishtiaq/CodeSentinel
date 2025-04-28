const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a project name'],
        trim: true
    },
    repository: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository'
    },
    description: {
        type: String,
        trim: true
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
        enum: ['active', 'archived', 'deleted'],
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
    }
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