const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const User = require('../models/User');

const seedDatabase = async () => {
    try {
        // Sync database first
        await sequelize.sync({ force: true });
        console.log('✅ Database synced');

        // Create admin user
        const adminExists = await User.findOne({ where: { email: 'admin@goag.com' } });
        if (!adminExists) {
            await User.create({
                id: '11111111-1111-1111-1111-111111111111',
                name: 'Admin User',
                email: 'admin@goag.com',
                password: 'admin123',
                role: 'admin',
                department: 'Management',
                hasAccess: true
            });
            console.log('✅ Admin user created');
        }

        // Create sales manager
        const salesExists = await User.findOne({ where: { email: 'sales@goag.com' } });
        if (!salesExists) {
            await User.create({
                id: '22222222-2222-2222-2222-222222222222',
                name: 'Sales Manager',
                email: 'sales@goag.com',
                password: 'sales123',
                role: 'sales',
                department: 'Sales',
                hasAccess: true
            });
            console.log('✅ Sales manager created');
        }

        // Create production manager
        const prodExists = await User.findOne({ where: { email: 'production@goag.com' } });
        if (!prodExists) {
            await User.create({
                id: '33333333-3333-3333-3333-333333333333',
                name: 'Production Manager',
                email: 'production@goag.com',
                password: 'prod123',
                role: 'production',
                department: 'Production',
                hasAccess: true
            });
            console.log('✅ Production manager created');
        }

        // Create after-sales manager
        const afterSalesExists = await User.findOne({ where: { email: 'aftersales@goag.com' } });
        if (!afterSalesExists) {
            await User.create({
                id: '55555555-5555-5555-5555-555555555555',
                name: 'After Sales Manager',
                email: 'aftersales@goag.com',
                password: 'aftersales123',
                role: 'aftersales',
                department: 'After Sales',
                hasAccess: true
            });
            console.log('✅ After Sales manager created');
        }

        // Create quality manager
        const qualityExists = await User.findOne({ where: { email: 'quality@goag.com' } });
        if (!qualityExists) {
            await User.create({
                id: '66666666-6666-6666-6666-666666666666',
                name: 'Quality Manager',
                email: 'quality@goag.com',
                password: 'quality123',
                role: 'quality',
                department: 'Quality',
                hasAccess: true
            });
            console.log('✅ Quality manager created');
        }

        // Create accountant
        const accountantExists = await User.findOne({ where: { email: 'accountant@goag.com' } });
        if (!accountantExists) {
            await User.create({
                id: '77777777-7777-7777-7777-777777777777',
                name: 'Accountant',
                email: 'accountant@goag.com',
                password: 'accountant123',
                role: 'accountant',
                department: 'Finance',
                hasAccess: true
            });
            console.log('✅ Accountant created');
        }

        // Create employee
        const empExists = await User.findOne({ where: { email: 'employee@goag.com' } });
        if (!empExists) {
            await User.create({
                id: '44444444-4444-4444-4444-444444444444',
                name: 'Employee User',
                email: 'employee@goag.com',
                password: 'emp123',
                role: 'employee',
                department: 'Production',
                hasAccess: true
            });
            console.log('✅ Employee created');
        }

        console.log('🎉 Seed data inserted successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seedDatabase();