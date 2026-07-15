import axios from 'axios';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
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
        
        // Skip auth redirect for public endpoints
        const isPublicEndpoint = 
            url.endsWith('/auth/login') || 
            url.endsWith('/auth/signup') || 
            url.endsWith('/auth/google-login') || 
            url.endsWith('/auth/verify-email') || 
            url.endsWith('/auth/forgot-password') || 
            url.endsWith('/auth/reset-password') || 
            url.endsWith('/auth/google-client-id');

        if ((status === 401 || status === 403) && !isPublicEndpoint) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth-changed'));
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
