const { User } = require('../models');
const logger = require('../utils/logger');

const getUsers = async (req, res) => {
    try {
        console.log('🔄 Fetching all users...');

        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        console.log(`✅ Found ${users.length} users`);

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('❌ Get users error:', error);
        logger.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch users',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

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
            message: 'Failed to fetch user'
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, department, role, hasAccess } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from changing their own role/access
        if (id === req.user.id && (role || hasAccess !== undefined)) {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify your own role or access'
            });
        }

        await user.update({
            name: name || user.name,
            email: email || user.email,
            phone: phone || user.phone,
            department: department || user.department,
            role: role || user.role,
            hasAccess: hasAccess !== undefined ? hasAccess : user.hasAccess
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        logger.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting own account
        if (id === req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        const user = await User.findByPk(id);
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

        await user.destroy();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        logger.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};

const toggleUserAccess = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify your own access'
            });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.update({ hasAccess: !user.hasAccess });

        res.json({
            success: true,
            message: `User access ${user.hasAccess ? 'enabled' : 'disabled'}`,
            data: user
        });
    } catch (error) {
        logger.error('Toggle access error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle user access'
        });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserAccess
};

console.log('✅ userController loaded with methods:', Object.keys({
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserAccess
}));

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserAccess
};