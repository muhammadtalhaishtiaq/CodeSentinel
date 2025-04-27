/**
 * MongoDB Initialization Script
 * Run with: node src/scripts/init-db.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const mongoose = require('mongoose');

// Connect to MongoDB
const initMongoDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log('Database initialized. Collections will be created automatically as needed.');

        // Disconnect after initialization
        await mongoose.disconnect();
        console.log('MongoDB disconnected. Initialization complete.');
    } catch (error) {
        console.error(`MongoDB initialization error: ${error.message}`);
        process.exit(1);
    }
};

// Call the initialization function
initMongoDB();