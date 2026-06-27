const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://goag-erp-backend.onrender.com/api'
  : 'http://localhost:5002/api';

export const droneAPI = {
  getAll: async (token) => {
    try {
      const response = await fetch(`${API_URL}/drones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  create: async (data, token) => {
    try {
      const response = await fetch(`${API_URL}/drones`, {
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

  update: async (id, data, token) => {
    try {
      const response = await fetch(`${API_URL}/drones/${id}`, {
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

  delete: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/drones/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateStatus: async (id, status, token) => {
    try {
      const response = await fetch(`${API_URL}/drones/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};