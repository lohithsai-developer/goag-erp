const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

console.log('🔍 Initializing Firebase...');

let serviceAccount;
let firebaseApp;
let db;
let auth;

// Load service account
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('📁 Loading service account from environment variable...');
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✅ Service account parsed successfully');
        console.log('📋 Project ID:', serviceAccount.project_id);
    } catch (error) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message);
        process.exit(1);
    }
} else {
    console.log('📁 Loading service account from file...');
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    if (!fs.existsSync(serviceAccountPath)) {
        console.error('❌ Service account file not found at:', serviceAccountPath);
        process.exit(1);
    }
    try {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log('✅ Service account loaded from file');
        console.log('📋 Project ID:', serviceAccount.project_id);
    } catch (error) {
        console.error('❌ Error reading service account file:', error.message);
        process.exit(1);
    }
}

// Initialize Firebase (synchronous - no await)
try {
    if (admin.apps && admin.apps.length > 0) {
        firebaseApp = admin.apps[0];
        console.log('✅ Firebase already initialized');
    } else {
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase initialized successfully');
    }

    // Get Firestore and Auth instances
    db = firebaseApp.firestore();
    auth = firebaseApp.auth();

    console.log('✅ Firestore and Auth ready');
    console.log('📋 Project ID:', serviceAccount.project_id);

} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    process.exit(1);
}

// Test connection (using a separate function)
async function testFirestoreConnection() {
    try {
        console.log('🔍 Testing Firestore connection...');
        await db.collection('_test').doc('test').set({ test: true, timestamp: new Date().toISOString() });
        await db.collection('_test').doc('test').delete();
        console.log('✅ Firestore connection verified');
    } catch (error) {
        console.error('❌ Firestore connection test failed:', error.message);
        // Don't exit - just warn
    }
}

// Run the test connection (don't await - just let it run)
testFirestoreConnection();

console.log('📤 Exporting Firebase modules...');

module.exports = {
    firebaseApp,
    db,
    auth,
    admin
};