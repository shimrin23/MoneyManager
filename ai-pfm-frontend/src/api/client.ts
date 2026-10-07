import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
const normalizedBaseUrl = rawApiUrl.endsWith('/api')
    ? rawApiUrl
    : `${rawApiUrl.replace(/\/+$/, '')}/api`;

export const apiClient = axios.create({
    baseURL: normalizedBaseUrl,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';
        
        // Skip auth redirect for public endpoints (strip query params first)
        const cleanUrl = (url.split('?')[0] || '').toLowerCase();
        const isPublicEndpoint = 
            cleanUrl.endsWith('/auth/login') || 
            cleanUrl.endsWith('/auth/signup') || 
            cleanUrl.endsWith('/auth/google-login') || 
            cleanUrl.endsWith('/auth/verify-email') || 
            cleanUrl.endsWith('/auth/resend-verification') || 
            cleanUrl.endsWith('/auth/forgot-password') || 
            cleanUrl.endsWith('/auth/reset-password') || 
            cleanUrl.endsWith('/auth/google-client-id');

        if ((status === 401 || status === 403) && !isPublicEndpoint) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth-changed'));
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
