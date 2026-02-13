const mongoose = require('mongoose');
const Repository = require('../models/Repository');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

async function ensureRepositoryIndexes() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Drop all existing indexes except _id
        console.log('Dropping existing indexes...');
        await Repository.collection.dropIndexes();
        console.log('✅ Indexes dropped');

        // Recreate the unique compound index
        console.log('Creating unique compound index...');
        await Repository.collection.createIndex(
            { user: 1, provider: 1, repoId: 1 },
            { unique: true }
        );
        console.log('✅ Unique index created on (user, provider, repoId)');

        // Check for any existing duplicates
        const duplicates = await Repository.aggregate([
            {
                $group: {
                    _id: { user: '$user', provider: '$provider', repoId: '$repoId' },
                    count: { $sum: 1 },
                    ids: { $push: '$_id' }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            }
        ]);

        if (duplicates.length > 0) {
            console.log(`\n⚠️  Found ${duplicates.length} duplicate repository groups`);
            console.log('Removing duplicates (keeping the most recent)...');

            for (const dup of duplicates) {
                // Keep the first ID, delete the rest
                const idsToDelete = dup.ids.slice(1);
                await Repository.deleteMany({ _id: { $in: idsToDelete } });
                console.log(`   Removed ${idsToDelete.length} duplicate(s)`);
            }

            console.log('✅ Duplicates cleaned up');
        } else {
            console.log('✅ No duplicates found');
        }

        // Show final count
        const totalRepos = await Repository.countDocuments();
        console.log(`\nTotal repositories in database: ${totalRepos}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

ensureRepositoryIndexes();
