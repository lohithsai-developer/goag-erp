const firebaseService = require('../services/firebase.service');
const bcrypt = require('bcryptjs');

const COLLECTION = 'users';

class UserFirebase {
    // Create a new user
    static async create(userData) {
        try {
            // Hash password
            if (userData.password) {
                userData.password = await bcrypt.hash(userData.password, 10);
            }

            // Add timestamps
            userData.createdAt = new Date().toISOString();
            userData.updatedAt = new Date().toISOString();

            // Use email as document ID for easy lookup
            const docId = userData.email;

            const result = await firebaseService.create(COLLECTION, userData, docId);
            return result;
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    // Get all users
    static async findAll() {
        try {
            const users = await firebaseService.getAll(COLLECTION, 'createdAt', 'desc');
            return users;
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const user = await firebaseService.getById(COLLECTION, email);
            return user;
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    // Find user by ID (email)
    static async findById(id) {
        try {
            const user = await firebaseService.getById(COLLECTION, id);
            return user;
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    // Update user
    static async update(email, updateData) {
        try {
            // If password is being updated, hash it
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            updateData.updatedAt = new Date().toISOString();

            const result = await firebaseService.update(COLLECTION, email, updateData);
            return result;
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    // Delete user
    static async delete(email) {
        try {
            const result = await firebaseService.delete(COLLECTION, email);
            return result;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    // Find users by role
    static async findByRole(role) {
        try {
            const users = await firebaseService.getWhere(COLLECTION, { role });
            return users;
        } catch (error) {
            throw new Error(`Error finding users by role: ${error.message}`);
        }
    }

    // Toggle user access
    static async toggleAccess(email) {
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            const newAccess = !user.hasAccess;
            const result = await firebaseService.update(COLLECTION, email, {
                hasAccess: newAccess,
                updatedAt: new Date().toISOString()
            });

            return result;
        } catch (error) {
            throw new Error(`Error toggling user access: ${error.message}`);
        }
    }

    // Compare password
    static async comparePassword(email, password) {
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                return false;
            }

            return await bcrypt.compare(password, user.password);
        } catch (error) {
            throw new Error(`Error comparing password: ${error.message}`);
        }
    }
}

module.exports = UserFirebase;