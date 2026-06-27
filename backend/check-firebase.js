const { db } = require('./src/config/firebase');

async function checkFirebase() {
    try {
        console.log('🔍 Checking Firebase data...');

        // Get all users from Firestore
        const snapshot = await db.collection('users').get();

        if (snapshot.empty) {
            console.log('❌ No users found in Firebase!');
            console.log('Please add users manually in Firestore console.');
            process.exit(1);
        }

        console.log(`✅ Found ${snapshot.size} users in Firebase:`);
        console.log('---');
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`📄 Document ID: ${doc.id}`);
            console.log(`   Name: ${data.name}`);
            console.log(`   Email: ${data.email}`);
            console.log(`   Role: ${data.role}`);
            console.log(`   Has Access: ${data.hasAccess}`);
            console.log('---');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkFirebase();