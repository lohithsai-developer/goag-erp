const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

console.log('🔍 Direct Firebase test...');

// Load service account
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = app.firestore();

async function test() {
    try {
        console.log('📝 Testing Firestore...');

        // Try to write a test document
        const testRef = db.collection('test').doc('test123');
        await testRef.set({
            message: 'Hello from GOAG ERP!',
            timestamp: new Date().toISOString()
        });
        console.log('✅ Write successful!');

        // Try to read it back
        const doc = await testRef.get();
        if (doc.exists) {
            console.log('✅ Read successful!');
            console.log('📄 Data:', doc.data());
        }

        // Clean up
        await testRef.delete();
        console.log('✅ Cleanup successful!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

test();