// src/services/customerAPI.js
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://goag-erp-backend.onrender.com/api'
  : 'http://localhost:5002/api';

// ── TEMP CUSTOMER API ──────────────────────────────────────────────────────
export const tempCustomerAPI = {
  // Get all temp customers
  getAll: async (token) => {
    try {
      const response = await fetch(`${API_URL}/temp-customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Create temp customer
  create: async (data, token) => {
    try {
      const response = await fetch(`${API_URL}/temp-customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update temp customer
  update: async (id, data, token) => {
    try {
      const response = await fetch(`${API_URL}/temp-customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Delete temp customer
  delete: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/temp-customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Convert temp customer to actual customer
  convertToCustomer: async (tempId, customerData, token) => {
    try {
      const response = await fetch(`${API_URL}/temp-customers/${tempId}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(customerData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ── ACTUAL CUSTOMER API ────────────────────────────────────────────────────
export const customerAPI = {
  // Get all customers
  getAll: async (token) => {
    try {
      const response = await fetch(`${API_URL}/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get customer by ID
  getById: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/customers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update customer
  update: async (id, data, token) => {
    try {
      const response = await fetch(`${API_URL}/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Delete customer
  delete: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get customer orders
  getOrders: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/customers/${id}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};