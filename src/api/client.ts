import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

client.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Redirect to login or handle session expiry
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
