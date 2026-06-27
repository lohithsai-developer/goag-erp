const { v4: uuidv4 } = require('uuid');

exports.generateId = () => uuidv4();

exports.formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString();
};

exports.getPagination = (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return { offset, limit };
};

exports.getOrderNumber = (prefix, count) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}-${year}${month}${day}-${seq}`;
};

exports.sanitizeInput = (obj) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = value.trim();
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};