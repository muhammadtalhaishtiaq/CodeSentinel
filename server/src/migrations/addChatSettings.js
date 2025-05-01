const mongoose = require('mongoose');
const Project = require('../models/Project');
require('dotenv').config();

async function migrate() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Update all projects with default chat settings
        const result = await Project.updateMany({ chatSettings: { $exists: false } }, {
            $set: {
                chatSettings: {
                    enabled: true,
                    model: 'claude-3-7-sonnet',
                    temperature: 0.7,
                    maxTokens: 2000
                },
                lastChatActivity: null
            }
        });

        console.log(`Updated ${result.nModified} projects with chat settings`);

        // Create indexes
        await Project.collection.createIndex({ user: 1, status: 1 });
        await Project.collection.createIndex({ 'chatSettings.enabled': 1 });
        await Project.collection.createIndex({ lastChatActivity: 1 });

        console.log('Created indexes for chat-related fields');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Migration completed successfully');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();