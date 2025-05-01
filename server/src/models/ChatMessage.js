const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'system'],
        required: true
    },
    metadata: {
        scanId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Scan'
        },
        filePath: String,
        vulnerabilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vulnerability'
        }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);