import api from './api';

// Report a post as spam / fake / inappropriate
export const createFlag = async (data) => (await api.post('/flags', data)).data;
