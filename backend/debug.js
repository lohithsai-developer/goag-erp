console.log('=== DEBUG START ===');

try {
    console.log('1. Loading dotenv...');
    require('dotenv').config();
    console.log('✅ dotenv loaded');
    console.log('PORT:', process.env.PORT);
    console.log('DB_STORAGE:', process.env.DB_STORAGE);
} catch (err) {
    console.error('❌ Error loading dotenv:', err.message);
}

try {
    console.log('2. Loading express...');
    const express = require('express');
    console.log('✅ express loaded');
} catch (err) {
    console.error('❌ Error loading express:', err.message);
}

try {
    console.log('3. Loading database...');
    const { sequelize } = require('./src/config/database');
    console.log('✅ database loaded');
} catch (err) {
    console.error('❌ Error loading database:', err.message);
    console.error('Stack:', err.stack);
}

try {
    console.log('4. Loading models...');
    const { User } = require('./src/models');
    console.log('✅ models loaded');
} catch (err) {
    console.error('❌ Error loading models:', err.message);
    console.error('Stack:', err.stack);
}

try {
    console.log('5. Loading routes...');
    const authRoutes = require('./src/routes/authRoutes');
    const userRoutes = require('./src/routes/userRoutes');
    console.log('✅ routes loaded');
} catch (err) {
    console.error('❌ Error loading routes:', err.message);
    console.error('Stack:', err.stack);
}

console.log('=== DEBUG END ===');