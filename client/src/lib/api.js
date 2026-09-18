export const API_URL = '/api';

export function getToken() {
  return localStorage.getItem('medicare_token');
}

export function getStoredUser() {
  const raw = localStorage.getItem('medicare_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeAuth(token, user) {
  localStorage.setItem('medicare_token', token);
  localStorage.setItem('medicare_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('medicare_token');
  localStorage.removeItem('medicare_user');
}

export async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}
