import axios from 'axios';
import { getMyVoices, uploadVoice } from './voices';

const API_BASE_URL = '/api'; // Adjusted to relative path to leverage proxy

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const api = {
    auth: {
        login: (credentials: any) => apiClient.post('/auth/login', credentials),
        register: (data: any) => apiClient.post('/auth/register', data),
        getMe: () => apiClient.get('/auth/me'),
        changePassword: (data: any) => apiClient.post('/auth/change-password', data),
    },
    stories: {
        list: (keyword?: string, status?: string) =>
            apiClient.get('/stories', { params: { keyword, status } }),
        get: (id: string) => apiClient.get(`/stories/${id}`),
        getContent: (id: string, guestId?: string) => apiClient.get(`/stories/${id}/content`, {
            headers: guestId ? { 'X-Guest-Id': guestId } : {}
        }),
        generate: (data: any) => apiClient.post('/stories/generate', data),
    },
    history: {
        list: () => apiClient.get('/history'),
        record: (data: any) => apiClient.post('/history', data),
    },
    voices: {
        list: getMyVoices,
        upload: uploadVoice
    }
};
