const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');

async function test() {
    try {
        console.log('Testing models...');
        await sequelize.authenticate();
        console.log('✅ Database connected');

        console.log('✅ User model loaded');
        console.log('User model name:', User.name);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

test();