import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStats = async () => {
  const response = await api.get('/api/stats');
  return response.data;
};

export const getLogs = async () => {
  const response = await api.get('/api/logs');
  return response.data;
};

export const openGate = async (logId) => {
  const response = await api.post('/api/keluar', { id: logId });
  return response.data;
};
