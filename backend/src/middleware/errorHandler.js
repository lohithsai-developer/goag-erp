const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry',
            errors: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;