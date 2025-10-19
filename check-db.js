// Quick script to check MongoDB data
// Run: node check-db.js

require('dotenv').config({ path: '.env.development' });
const mongoose = require('mongoose');

async function checkData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📦 Collections in database:');
        collections.forEach(col => console.log(`   - ${col.name}`));
        console.log('');

        // Check users
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const users = await User.find({}).select('-password');
        
        console.log(`👥 Total Users: ${users.length}`);
        users.forEach((user, i) => {
            console.log(`\nUser ${i + 1}:`);
            console.log(`   Name: ${user.firstName} ${user.lastName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Created: ${user.createdAt}`);
        });

        // Check projects
        const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
        const projects = await Project.find({});
        console.log(`\n📁 Total Projects: ${projects.length}`);

        // Check scans
        const Scan = mongoose.model('Scan', new mongoose.Schema({}, { strict: false }));
        const scans = await Scan.find({});
        console.log(`🔍 Total Scans: ${scans.length}`);

        mongoose.connection.close();
        console.log('\n✅ Done!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkData();


