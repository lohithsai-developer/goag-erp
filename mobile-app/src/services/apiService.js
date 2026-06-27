// API Service - Connects to Backend
const API_BASE_URL = 'http://localhost:5002/api';

// Helper to get auth token
const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token || '';
};

// API call wrapper
const apiCall = async (endpoint, method = 'GET', data = null) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: error.message };
    }
};

// ============ AUTH APIs ============
export const authAPI = {
    login: async (email, password) => {
        return await apiCall('/auth/login', 'POST', { email, password });
    },
    register: async (userData) => {
        return await apiCall('/auth/register', 'POST', userData);
    },
    getMe: async () => {
        return await apiCall('/auth/me');
    },
    updateProfile: async (data) => {
        return await apiCall('/auth/profile', 'PUT', data);
    },
    changePassword: async (data) => {
        return await apiCall('/auth/change-password', 'PUT', data);
    }
};

// ============ USER APIs ============
export const userAPI = {
    getAll: async () => {
        return await apiCall('/users');
    },
    getById: async (id) => {
        return await apiCall(`/users/${id}`);
    },
    create: async (userData) => {
        return await apiCall('/users', 'POST', userData);
    },
    update: async (id, userData) => {
        return await apiCall(`/users/${id}`, 'PUT', userData);
    },
    delete: async (id) => {
        return await apiCall(`/users/${id}`, 'DELETE');
    },
    toggleAccess: async (id) => {
        return await apiCall(`/users/${id}/toggle-access`, 'POST');
    }
};

// ============ DRONE APIs ============
export const droneAPI = {
    getAll: async () => {
        return await apiCall('/drones');
    },
    getById: async (id) => {
        return await apiCall(`/drones/${id}`);
    },
    create: async (droneData) => {
        return await apiCall('/drones', 'POST', droneData);
    },
    update: async (id, droneData) => {
        return await apiCall(`/drones/${id}`, 'PUT', droneData);
    },
    delete: async (id) => {
        return await apiCall(`/drones/${id}`, 'DELETE');
    }
};

// ============ ORDER APIs ============
export const orderAPI = {
    getAll: async () => {
        return await apiCall('/orders');
    },
    getById: async (id) => {
        return await apiCall(`/orders/${id}`);
    },
    create: async (orderData) => {
        return await apiCall('/orders', 'POST', orderData);
    },
    update: async (id, orderData) => {
        return await apiCall(`/orders/${id}`, 'PUT', orderData);
    },
    delete: async (id) => {
        return await apiCall(`/orders/${id}`, 'DELETE');
    },
    updateStatus: async (id, status) => {
        return await apiCall(`/orders/${id}/status`, 'PATCH', { status });
    }
};

// ============ QUOTATION APIs ============
export const quotationAPI = {
    getAll: async () => {
        return await apiCall('/quotations');
    },
    getById: async (id) => {
        return await apiCall(`/quotations/${id}`);
    },
    create: async (quotationData) => {
        return await apiCall('/quotations', 'POST', quotationData);
    },
    update: async (id, quotationData) => {
        return await apiCall(`/quotations/${id}`, 'PUT', quotationData);
    },
    delete: async (id) => {
        return await apiCall(`/quotations/${id}`, 'DELETE');
    },
    updateStatus: async (id, status) => {
        return await apiCall(`/quotations/${id}/status`, 'PATCH', { status });
    }
};

// ============ TASK APIs ============
export const taskAPI = {
    getAll: async () => {
        return await apiCall('/tasks');
    },
    getById: async (id) => {
        return await apiCall(`/tasks/${id}`);
    },
    create: async (taskData) => {
        return await apiCall('/tasks', 'POST', taskData);
    },
    update: async (id, taskData) => {
        return await apiCall(`/tasks/${id}`, 'PUT', taskData);
    },
    delete: async (id) => {
        return await apiCall(`/tasks/${id}`, 'DELETE');
    },
    updateStatus: async (id, status) => {
        return await apiCall(`/tasks/${id}/status`, 'PATCH', { status });
    }
};

// ============ SERVICE REQUEST APIs ============
export const serviceRequestAPI = {
    getAll: async () => {
        return await apiCall('/service-requests');
    },
    getById: async (id) => {
        return await apiCall(`/service-requests/${id}`);
    },
    create: async (serviceData) => {
        return await apiCall('/service-requests', 'POST', serviceData);
    },
    update: async (id, serviceData) => {
        return await apiCall(`/service-requests/${id}`, 'PUT', serviceData);
    },
    delete: async (id) => {
        return await apiCall(`/service-requests/${id}`, 'DELETE');
    },
    updateStatus: async (id, status) => {
        return await apiCall(`/service-requests/${id}/status`, 'PATCH', { status });
    }
};