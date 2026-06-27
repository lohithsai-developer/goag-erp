const jwt = require('jsonwebtoken');
const UserFirebase = require('../models/UserFirebase');
const logger = require('../utils/logger');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.email,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

const register = async (req, res) => {
    try {
        const { name, email, password, role, department, phone } = req.body;

        // Check if user exists
        const existingUser = await UserFirebase.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await UserFirebase.create({
            name,
            email,
            password,
            role: role || 'employee',
            department: department || '',
            phone: phone || '',
            hasAccess: true
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
            message: error.message || 'Registration failed'
        });
    }
};

const login = async (req, res) => {
    try {
        console.log('📡 Login request received');
        console.log('📝 Email:', req.body.email);
        console.log('🔍 Password provided:', req.body.password ? 'Yes' : 'No');

        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        console.log('🔍 Finding user by email:', email);
        let user;
        try {
            user = await UserFirebase.findByEmail(email);
            console.log('👤 User found:', user ? 'Yes' : 'No');
            if (user) {
                console.log('👤 User role:', user.role);
                console.log('👤 Has Access:', user.hasAccess);
                console.log('🔑 Password hash exists:', user.password ? 'Yes' : 'No');
            }
        } catch (findError) {
            console.error('❌ Error finding user:', findError.message);
            console.error('❌ Stack:', findError.stack);
            return res.status(500).json({
                success: false,
                message: 'Error finding user: ' + findError.message
            });
        }

        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare password
        console.log('🔑 Comparing password...');
        let isPasswordValid;
        try {
            isPasswordValid = await UserFirebase.comparePassword(email, password);
            console.log('✅ Password valid:', isPasswordValid);
        } catch (compareError) {
            console.error('❌ Error comparing password:', compareError.message);
            console.error('❌ Stack:', compareError.stack);
            return res.status(500).json({
                success: false,
                message: 'Error comparing password: ' + compareError.message
            });
        }

        if (!isPasswordValid) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user has access
        if (user.hasAccess === false) {
            console.log('❌ Account disabled for:', email);
            return res.status(403).json({
                success: false,
                message: 'Account is disabled. Please contact admin.'
            });
        }

        // Update last login
        try {
            await UserFirebase.update(email, { lastLogin: new Date().toISOString() });
            console.log('✅ Last login updated');
        } catch (updateError) {
            console.warn('⚠️ Could not update last login:', updateError.message);
        }

        // Generate token
        console.log('🔑 Generating token...');
        let token;
        try {
            token = generateToken(user);
            console.log('✅ Token generated successfully');
        } catch (tokenError) {
            console.error('❌ Error generating token:', tokenError.message);
            return res.status(500).json({
                success: false,
                message: 'Error generating token: ' + tokenError.message
            });
        }

        console.log('✅ Login successful for:', email);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        console.error('❌ Error stack:', error.stack);
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await UserFirebase.findByEmail(req.user.email);
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get profile'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone, department, profilePhoto } = req.body;
        const email = req.user.email;

        const user = await UserFirebase.update(email, {
            name: name,
            phone: phone,
            department: department,
            profilePhoto: profilePhoto
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
            message: error.message || 'Failed to update profile'
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const email = req.user.email;

        // Verify current password
        const isPasswordValid = await UserFirebase.comparePassword(email, currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        await UserFirebase.update(email, { password: newPassword });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        logger.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to change password'
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