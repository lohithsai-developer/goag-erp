const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(d => ({
                    field: d.path[0],
                    message: d.message
                }))
            });
        }

        next();
    };
};

// Validation schemas
const schemas = {
    register: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('admin', 'sales', 'production', 'aftersales', 'quality', 'accountant', 'employee'),
        department: Joi.string().max(100),
        phone: Joi.string().max(20)
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    updateUser: Joi.object({
        name: Joi.string().min(2).max(100),
        email: Joi.string().email(),
        phone: Joi.string().max(20),
        department: Joi.string().max(100),
        role: Joi.string().valid('admin', 'sales', 'production', 'aftersales', 'quality', 'accountant', 'employee'),
        hasAccess: Joi.boolean()
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required()
    })
};

module.exports = { validate, schemas };