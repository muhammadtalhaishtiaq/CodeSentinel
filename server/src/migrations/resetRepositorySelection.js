const mongoose = require('mongoose');
const Repository = require('../models/Repository');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function resetRepositorySelection() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update all repositories to isEnabled: false
        const result = await Repository.updateMany(
            {}, // Empty filter = all documents
            { $set: { isEnabled: false } }
        );

        console.log(`✅ Successfully reset ${result.modifiedCount} repositories to unselected`);
        console.log(`Total repositories in database: ${result.matchedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

resetRepositorySelection();
