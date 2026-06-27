const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://goag-erp-backend.onrender.com/api'
    : 'http://localhost:5002/api';

const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('authToken');
};

export const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (response.status === 401) {
        console.warn('🔐 Session expired, redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Session expired');
    }

    return data;
};

export const api = {
    get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (endpoint, body) => apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};