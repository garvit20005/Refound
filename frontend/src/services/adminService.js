import api from './api';

export const getStats = async () => (await api.get('/admin/stats')).data;
export const getUsers = async () => (await api.get('/admin/users')).data;
export const toggleBlockUser = async (id) => (await api.patch(`/admin/users/${id}/block`)).data;
export const getAllItems = async () => (await api.get('/admin/items')).data;
export const deleteAnyItem = async (id) => (await api.delete(`/admin/items/${id}`)).data;
export const getFlags = async () => (await api.get('/admin/flags')).data;
export const updateFlagStatus = async (id, status) =>
  (await api.patch(`/admin/flags/${id}`, { status })).data;
