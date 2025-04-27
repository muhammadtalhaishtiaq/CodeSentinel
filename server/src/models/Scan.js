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
            lineNumber: Number
        }],
        summary: {
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