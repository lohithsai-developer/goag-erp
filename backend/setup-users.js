const bcrypt = require('bcryptjs');
const { db } = require('./src/config/firebase');

const users = [
    {
        email: 'admin@goag.com',
        name: 'Admin User',
        password: 'admin123',
        role: 'admin',
        department: 'Management',
        phone: '+91 9876543210',
        hasAccess: true,
        createdAt: new Date().toISOString()
    },
    {
        email: 'sales@goag.com',
        name: 'Sales Manager',
        password: 'sales123',
        role: 'sales',
        department: 'Sales',
        phone: '+91 9876543211',
        hasAccess: true,
        createdAt: new Date().toISOString()
    },
    {
        email: 'production@goag.com',
        name: 'Production Manager',
        password: 'prod123',
        role: 'production',
        department: 'Production',
        phone: '+91 9876543212',
        hasAccess: true,
        createdAt: new Date().toISOString()
    },
    {
        email: 'aftersales@goag.com',
        name: 'After Sales Manager',
        password: 'aftersales123',
        role: 'aftersales',
        department: 'After Sales',
        phone: '+91 9876543213',
        hasAccess: true,
        createdAt: new Date().toISOString()
    },
    {
        email: 'quality@goag.com',
        name: 'Quality Manager',
        password: 'quality123',
        role: 'quality',
        department: 'Quality',
        phone: '+91 9876543214',
        hasAccess: true,
        createdAt: new Date().toISOString()
    },
    {
        email: 'accountant@goag.com',
        name: 'Accountant',
        password: 'accountant123',
        role: 'accountant',
        department: 'Finance',
        phone: '+91 9876543215',
        hasAccess: true,
        createdAt: new Date().toISOString()
    },
    {
        email: 'employee@goag.com',
        name: 'Employee User',
        password: 'emp123',
        role: 'employee',
        department: 'Production',
        phone: '+91 9876543216',
        hasAccess: true,
        createdAt: new Date().toISOString()
    }
];

async function setupUsers() {
    try {
        console.log('🔧 Setting up users in Firebase...');

        for (const user of users) {
            // Hash password
            const hashedPassword = await bcrypt.hash(user.password, 10);
            user.password = hashedPassword;

            // Use email as document ID
            const docRef = db.collection('users').doc(user.email);

            // Check if user exists
            const doc = await docRef.get();
            if (doc.exists) {
                console.log(`⏭️ User already exists: ${user.email}`);
                continue;
            }

            // Create user
            await docRef.set(user);
            console.log(`✅ User created: ${user.email}`);
        }

        console.log('✅ All users setup complete!');
        console.log('📋 You can now login with:');
        console.log('   Email: admin@goag.com');
        console.log('   Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

setupUsers();