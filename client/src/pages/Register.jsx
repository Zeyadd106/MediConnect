import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL, storeAuth } from '../lib/api.js';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      storeAuth(data.token, data.user);
      navigate(data.user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cls = 'block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          <p className="mt-2 text-gray-600">Join MediCare to connect with healthcare professionals</p>
        </div>
        {error && <div className="p-4 text-red-700 bg-red-100 rounded-md">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={submit}>
          <div><label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input className={cls} value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div><label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" className={cls} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label className="block text-sm font-medium text-gray-700">Password (min 8 characters)</label>
            <input type="password" minLength={8} className={cls} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div><label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" className={cls} value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
          <div><label className="block text-sm font-medium text-gray-700">Account Type</label>
            <select className={cls} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select></div>
          <button type="submit" disabled={loading}
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account? <Link to="/login" className="font-medium text-blue-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
