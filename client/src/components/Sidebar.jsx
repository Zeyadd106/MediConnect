import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, LayoutDashboard, LogOut, CalendarDays } from 'lucide-react';
import { clearAuth, API_URL } from '../lib/api.js';
import { disconnectSocket } from '../lib/socket.js';

export default function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const base = role === 'doctor' ? '/doctor' : '/patient';
  const links = [
    { href: `${base}/dashboard`, label: 'Dashboard', Icon: LayoutDashboard },
    { href: `${base}/chat`, label: 'Chat', Icon: MessageSquare },
    { href: `${base}/appointments`, label: 'Appointments', Icon: CalendarDays },
  ];

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
      disconnectSocket();
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <div className="sidebar">
      <h4 className="flex items-center justify-center mb-6 text-xl font-bold">
        <Heart className="w-6 h-6 mr-2" /> MediCare
      </h4>
      <nav>
        {links.map(({ href, label, Icon }) => (
          <Link
            key={href}
            to={href}
            className={`flex items-center px-4 py-2 mb-1 ${location.pathname === href ? 'active' : ''}`}
          >
            <Icon className="w-5 h-5 mr-2" />
            {label}
          </Link>
        ))}
        <button onClick={logout} className="flex items-center w-full px-4 py-2 mt-4 text-white hover:bg-[#2c4a7c] text-left">
          <LogOut className="w-5 h-5 mr-2" /> Logout
        </button>
      </nav>
    </div>
  );
}
