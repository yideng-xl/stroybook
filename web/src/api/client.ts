import axios from 'axios';

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
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Guest-Id'] = guestId || '';
    return config;
});

export const api = {
    auth: {
        login: (data: any) => client.post('/auth/login', data),
        register: (data: any) => client.post('/auth/register', data),
        changePassword: (data: any) => client.post('/auth/change-password', data),
    },
    stories: {
        list: (keyword?: string) => client.get('/stories', { params: { keyword } }),
        get: (id: string) => client.get(`/stories/${id}`),
        getContent: (id: string) => client.get(`/stories/${id}/content`),
    },
    history: {
        list: () => client.get('/history'),
        save: (data: { storyId: string; styleName: string; currentPage: number; durationSeconds?: number }) => client.post('/history', data),
    },
};
