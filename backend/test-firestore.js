const { db } = require('./src/config/firebase');

async function testFirestore() {
    try {
        console.log('🔍 Testing Firestore connection...');

        // Try to read the users collection
        const snapshot = await db.collection('users').get();

        console.log(`✅ Connected to Firestore!`);
        console.log(`📊 Found ${snapshot.size} users`);

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`📄 ${doc.id}: ${data.name} (${data.role})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testFirestore();