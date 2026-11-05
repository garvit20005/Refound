import api from './api';

export const registerUser = async (data) => (await api.post('/auth/register', data)).data;
export const loginUser = async (data) => (await api.post('/auth/login', data)).data;
export const getMe = async () => (await api.get('/auth/me')).data;
export const updateProfile = async (data) => (await api.put('/auth/profile', data)).data;
