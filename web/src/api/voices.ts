import axios from 'axios';
import { UserVoice } from '../types';

const API_BASE = '/api/voices';

export const getMyVoices = async (): Promise<UserVoice[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(API_BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const uploadVoice = async (name: string, file: File): Promise<UserVoice> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('name', name);
  formData.append('file', file);

  const response = await axios.post(API_BASE, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
