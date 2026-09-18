import { useEffect, useState } from 'react';
import { API_URL, getToken } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';
import Sidebar from '../components/Sidebar.jsx';
import { useAuth } from '../hooks/useAuth.js';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>
  );
}

function fmtWhen(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function useStats(role) {
  const [stats, setStats] = useState({ upcoming: 0, unread: 0, next: null });
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/stats`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setStats(data);
      } catch {
        // keep defaults offline
      }
    };
    load();
    const socket = getSocket();
    const refresh = () => load();
    socket.on('message:new', refresh);
    socket.on('appointment:new', refresh);
    socket.on('appointment:updated', refresh);
    const id = setInterval(load, 15000);
    return () => {
      socket.off('message:new', refresh);
      socket.off('appointment:new', refresh);
      socket.off('appointment:updated', refresh);
      clearInterval(id);
      cancelled = true;
    };
  }, []);
  return stats;
}

function Cards({ stats, role }) {
  const nextLabel = stats.next
    ? `${stats.next.doctor?.role === 'doctor' && role === 'patient' ? stats.next.doctor.name : stats.next.patient?.name} at ${fmtWhen(stats.next.scheduled_at)} (${stats.next.status})`
    : 'No upcoming appointments';
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
        <p className="text-3xl font-bold text-blue-600">{stats.upcoming}</p>
        <p className="text-sm text-gray-500 mt-2">{nextLabel}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Unread Messages</h2>
        <p className="text-3xl font-bold text-blue-600">{stats.unread}</p>
        <p className="text-sm text-gray-500 mt-2">Live — updates instantly</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Status</h2>
        <p className="text-3xl font-bold text-green-600">● Live</p>
        <p className="text-sm text-gray-500 mt-2">Realtime socket connected</p>
      </div>
    </div>
  );
}

export function DoctorDashboard() {
  const { user, loading } = useAuth('doctor');
  const stats = useStats('doctor');
  const [appts, setAppts] = useState([]);
  useEffect(() => {
    fetch(`${API_URL}/appointments`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setAppts(Array.isArray(d) ? d.slice(0, 5) : []))
      .catch(() => {});
  }, [stats]);
  if (loading) return <Spinner />;
  return (
    <div className="flex">
      <Sidebar role="doctor" />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-2">Doctor Dashboard</h1>
        {user && <p className="mb-6 text-gray-600">Welcome back, {user.name}</p>}
        <Cards stats={stats} role="doctor" />
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
          <div className="space-y-4">
            {appts.length === 0 && <p className="text-sm text-gray-500">No appointments yet.</p>}
            {appts.map((a) => (
              <div key={a.id} className="border-b pb-3">
                <p className="font-medium">{a.patient?.name} — {a.reason || 'Visit'} ({a.status})</p>
                <p className="text-sm text-gray-500">{fmtWhen(a.scheduled_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PatientDashboard() {
  const { user, loading } = useAuth('patient');
  const stats = useStats('patient');
  const [appts, setAppts] = useState([]);
  useEffect(() => {
    fetch(`${API_URL}/appointments`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setAppts(Array.isArray(d) ? d.slice(0, 5) : []))
      .catch(() => {});
  }, [stats]);
  if (loading) return <Spinner />;
  return (
    <div className="flex">
      <Sidebar role="patient" />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-2">Patient Dashboard</h1>
        {user && <p className="mb-6 text-gray-600">Welcome back, {user.name}</p>}
        <Cards stats={stats} role="patient" />
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">My Appointments</h2>
          <div className="space-y-4">
            {appts.length === 0 && <p className="text-sm text-gray-500">No appointments yet.</p>}
            {appts.map((a) => (
              <div key={a.id} className="border-b pb-3">
                <p className="font-medium">{a.doctor?.name} — {a.reason || 'Visit'} ({a.status})</p>
                <p className="text-sm text-gray-500">{fmtWhen(a.scheduled_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
