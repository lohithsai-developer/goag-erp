// src/services/userAPI.js
const API_URL = 'http://localhost:5002/api';

export const userAPI = {
    // ✅ GET all users
    getAll: async (token) => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getAll error:', error);
            return { success: false, message: error.message };
        }
    },

    // ✅ CREATE a user
    create: async (userData, token) => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ✅ UPDATE a user
    update: async (email, userData, token) => {
        try {
            const response = await fetch(`${API_URL}/users/${email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ✅ DELETE a user
    delete: async (email, token) => {
        try {
            const response = await fetch(`${API_URL}/users/${email}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ✅ TOGGLE user access
    toggleAccess: async (email, token) => {
        try {
            const response = await fetch(`${API_URL}/users/${email}/toggle-access`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};