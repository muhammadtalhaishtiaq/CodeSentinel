const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
    repositoryUrl: {
        type: String,
        required: [true, 'Please add a repository URL'],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'failed'],
        default: 'pending'
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
            potential_solution: String
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

module.exports = mongoose.model('Scan', ScanSchema);