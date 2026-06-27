const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

const register = async (req, res) => {
    try {
        const { name, email, password, role, department, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'employee',
            department,
            phone
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        logger.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user has access
        if (!user.hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Account is disabled. Please contact admin.'
            });
        }

        // Update last login
        await user.update({ lastLogin: new Date() });

        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone, department, profilePhoto } = req.body;
        const user = await User.findByPk(req.user.id);

        await user.update({
            name: name || user.name,
            phone: phone || user.phone,
            department: department || user.department,
            profilePhoto: profilePhoto || user.profilePhoto
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        await user.update({ password: newPassword });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        logger.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword
};