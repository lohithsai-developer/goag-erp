console.log('=== TEST START ===');

try {
    console.log('1. Loading config...');
    require('dotenv').config();
    console.log('✅ Config loaded');

    console.log('2. Loading express...');
    const express = require('express');
    console.log('✅ Express loaded');

    console.log('3. Creating app...');
    const app = express();
    console.log('✅ App created');

    console.log('4. Loading database...');
    const { sequelize } = require('./src/config/database');
    console.log('✅ Database loaded');

    console.log('5. Loading models...');
    const { User } = require('./src/models');
    console.log('✅ Models loaded');

    console.log('6. Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('7. Starting server...');
    const PORT = 5000;
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
    });

    console.log('=== TEST COMPLETE ===');
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
}