const jwt = require('jsonwebtoken');
const UserFirebase = require('../models/UserFirebase');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('🔍 Decoded token:', decoded);

        // Find user by email (since we use email as ID)
        const user = await UserFirebase.findByEmail(decoded.email);
        console.log('👤 Found user:', user ? user.email : 'Not found');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.hasAccess === false) {
            return res.status(403).json({
                success: false,
                message: 'Account is disabled'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Auth error:', error.message);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};

module.exports = { authMiddleware, authorize };