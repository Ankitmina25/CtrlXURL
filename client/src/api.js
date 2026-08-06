const API = 'http://localhost:3000/api';

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${API}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  profile: () => request('/auth/profile'),
};

export const urlAPI = {
  create: (body) => request('/url/create', { method: 'POST', body: JSON.stringify(body) }),
  getAll: (page = 1, search = '') => request(`/url/my-urls?page=${page}&search=${encodeURIComponent(search)}`),
  getStats: () => request('/url/dashboard'),
  delete: (id) => request(`/url/${id}`, { method: 'DELETE' }),
  analytics: (id) => request(`/url/${id}/analytics`),
};
