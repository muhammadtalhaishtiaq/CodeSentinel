const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    repositoryUrl: {
        type: String,
        trim: true,
        default: null
    },
    branch: {
        type: String,
        trim: true,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'failed'],
        default: 'pending'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    message: {
        type: String,
        default: null
    },
    currentFile: {
        type: String,
        default: null
    },
    totalFiles: {
        type: Number,
        default: 0
    },
    scannedFiles: {
        type: Number,
        default: 0
    },
    error: {
        type: String,
        default: null
    },
    result: {
        vulnerabilities: [{
            type: {
                type: String,
                required: true
            },
            severity: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                required: true
            },
            description: String,
            location: String,
            lineNumber: Number,
            file_path: String,
            file_name: String,
            file_extension: String,
            original_code: String,
            suggested_code: String,
            potential_impact: String,
            potential_solution: String,
            potential_risk: String,
            potential_mitigation: String,
            potential_prevention: String,
            potential_detection: String
        }],
        summary: {
            total: { type: Number, default: 0 },
            lowCount: { type: Number, default: 0 },
            mediumCount: { type: Number, default: 0 },
            highCount: { type: Number, default: 0 },
            criticalCount: { type: Number, default: 0 }
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date
});

// Index for efficient querying
ScanSchema.index({ project: 1, createdAt: -1 });
ScanSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model('Scan', ScanSchema);