const { db } = require('./src/config/firebase');

async function checkAllCollections() {
    try {
        console.log('🔍 Checking Firebase Collections...\n');

        const collections = ['users', 'drones', 'orders', 'quotations', 'tasks', 'serviceRequests'];

        for (const collectionName of collections) {
            const snapshot = await db.collection(collectionName).get();
            console.log(`📁 ${collectionName}: ${snapshot.size} documents`);

            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`   📄 ${doc.id}: ${data.name || data.customerName || data.title || 'No name'}`);
            });
            console.log('');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAllCollections();