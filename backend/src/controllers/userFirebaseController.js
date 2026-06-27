const UserFirebase = require('../models/UserFirebase');
const logger = require('../utils/logger');

const getUsers = async (req, res) => {
    try {
        console.log('🔄 Fetching all users from Firebase...');
        const users = await UserFirebase.findAll();
        console.log(`✅ Found ${users.length} users`);

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('❌ Get users error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch users'
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await UserFirebase.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        logger.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch user'
        });
    }
};

const createUser = async (req, res) => {
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

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    } catch (error) {
        logger.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create user'
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, department, role, hasAccess } = req.body;

        // Prevent admin from changing their own role/access
        if (id === req.user.email && (role || hasAccess !== undefined)) {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify your own role or access'
            });
        }

        const user = await UserFirebase.update(id, {
            name,
            email,
            phone,
            department,
            role,
            hasAccess
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        logger.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update user'
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting own account
        if (id === req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        const user = await UserFirebase.findByEmail(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting admin
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin user'
            });
        }

        await UserFirebase.delete(id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        logger.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete user'
        });
    }
};

const toggleUserAccess = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify your own access'
            });
        }

        const user = await UserFirebase.toggleAccess(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User access ${user.hasAccess ? 'enabled' : 'disabled'}`,
            data: user
        });
    } catch (error) {
        logger.error('Toggle access error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to toggle user access'
        });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserAccess
};