import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL, storeAuth } from '../lib/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      storeAuth(data.token, data.user);
      navigate(data.user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Login to MediCare</h1>
          <p className="mt-2 text-gray-600">Enter your credentials to access your account</p>
        </div>
        {error && <div className="p-4 text-red-700 bg-red-100 rounded-md">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={submit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            {loading ? 'Logging in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don&apos;t have an account? <Link to="/register" className="font-medium text-blue-600">Register here</Link>
        </p>
        <p className="text-xs text-center text-gray-400">Demo: doctor@example.com / patient@example.com — password: password</p>
      </div>
    </div>
  );
}
