import axios from 'axios';
import { authService } from '../context/AuthContext'; // Import the authService

const API_URL = 'http://localhost:8080/api';

import { v4 as uuidv4 } from 'uuid'; // Need to install uuid

// Init Guest ID
let guestId = localStorage.getItem('guest_id');
if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substr(2, 9); // Simple fallback if uuid not avail yet
    localStorage.setItem('guest_id', guestId);
}

export const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config) => {
    const token = authService.token; // Use authService's token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Guest-Id'] = guestId || '';
    return config;
});

// Add a response interceptor
client.interceptors.response.use(
    response => response,
    error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Prevent infinite loop if the error itself is from /auth/login or /auth/register
            if (originalRequest.url && (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register'))) {
                return Promise.reject(error);
            }
            
            console.warn('Token expired or unauthorized. Logging out...');
            authService.logout();
            // Optionally, open login modal after logout
            authService.openLoginModal();
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export const api = {
    auth: {
        login: (data: any) => client.post('/auth/login', data),
        register: (data: any) => client.post('/auth/register', data),
        changePassword: (data: any) => client.post('/auth/change-password', data),
    },
    stories: {
        list: (keyword?: string, status?: string) => client.get('/stories', { params: { keyword, status } }),
        get: (id: string) => client.get(`/stories/${id}`),
        getContent: (id: string) => client.get(`/stories/${id}/content`),
        generate: (data: { prompt: string; style: string }) => client.post('/stories/generate', data),
    },
    history: {
        list: () => client.get('/history'),
        save: (data: { storyId: string; styleName: string; currentPage: number; durationSeconds?: number }) => client.post('/history', data),
    },
};
