const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// SQLite configuration
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../', process.env.DB_STORAGE || 'database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Test connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ SQLite database connected successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to SQLite database:', error);
        return false;
    }
};

module.exports = { sequelize, testConnection };