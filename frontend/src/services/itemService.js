import api from './api';

// params example: { search: 'phone', category: 'Electronics', type: 'Lost' }
export const getItems = async (params = {}) => (await api.get('/items', { params })).data;
export const getMyItems = async () => (await api.get('/items/my')).data;
export const getItemById = async (id) => (await api.get(`/items/${id}`)).data;

// formData is used because we upload an image file
export const createItem = async (formData) => (await api.post('/items', formData)).data;
export const updateItem = async (id, formData) => (await api.put(`/items/${id}`, formData)).data;

export const markItemRecovered = async (id) => (await api.patch(`/items/${id}/recovered`)).data;
export const deleteItem = async (id) => (await api.delete(`/items/${id}`)).data;
