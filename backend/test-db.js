const { sequelize } = require('./src/config/database');

async function test() {
    try {
        console.log('Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connected!');
        console.log('✅ Database file:', sequelize.options.storage);
        process.exit(0);
    } catch (error) {
        console.error('❌ Database error:', error.message);
        process.exit(1);
    }
}

test();