import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, clearAuth } from '../lib/api.js';

export function useAuth(requiredRole) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      try {
        const token = localStorage.getItem('medicare_token');
        if (!token) return navigate('/login', { replace: true });
        const res = await fetch(`${API_URL}/user`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          clearAuth();
          return navigate('/login', { replace: true });
        }
        const me = await res.json();
        if (me.role !== requiredRole) return navigate('/login', { replace: true });
        setUser(me);
        localStorage.setItem('medicare_user', JSON.stringify(me));
      } catch {
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [navigate, requiredRole]);

  const logout = async () => {
    try {
      const token = localStorage.getItem('medicare_token');
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return { user, loading, logout };
}
