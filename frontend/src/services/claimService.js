import api from './api';

export const createClaim = async (data) => (await api.post('/claims', data)).data;
export const getMyClaims = async () => (await api.get('/claims/my')).data;
export const getReceivedClaims = async () => (await api.get('/claims/received')).data;
export const updateClaimStatus = async (id, status) =>
  (await api.patch(`/claims/${id}`, { status })).data;
