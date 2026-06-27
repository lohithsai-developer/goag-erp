const { sequelize } = require('../config/database');
const User = require('./User');
const UserFirebase = require('./UserFirebase');

// Import all models here
const models = {
    User,
    UserFirebase
};

module.exports = {
    sequelize,
    ...models
};