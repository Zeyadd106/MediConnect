import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, getToken } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';
import Sidebar from '../components/Sidebar.jsx';
import { useAuth } from '../hooks/useAuth.js';

function headers() {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

function fmtLocal(dt) {
  const d = new Date(dt);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PatientAppointments() {
  const { user, loading } = useAuth('patient');
  const [appts, setAppts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [when, setWhen] = useState(fmtLocal(Date.now() + 86400000));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const res = await fetch(`${API_URL}/appointments`, { headers: headers() });
    if (res.ok) setAppts(await res.json());
  };

  useEffect(() => {
    if (loading) return;
    load();
    fetch(`${API_URL}/doctors`, { headers: headers() })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        setDoctors(d);
        if (d[0]) setDoctorId(String(d[0].id));
      });
    const socket = getSocket();
    socket.on('appointment:new', load);
    socket.on('appointment:updated', load);
    return () => {
      socket.off('appointment:new', load);
      socket.off('appointment:updated', load);
    };
  }, [loading]);

  const book = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          doctor_id: Number(doctorId),
          scheduled_at: new Date(when).toISOString(),
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      setReason('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancel = async (id) => {
    await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ status: 'cancelled' }),
    });
    load();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex">
      <Sidebar role="patient" />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
        <form onSubmit={book} className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="border rounded-md px-3 py-2">
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="border rounded-md px-3 py-2" required />
          <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className="border rounded-md px-3 py-2" />
          <button className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700">Book</button>
        </form>
        {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-3">
          {appts.length === 0 && <p className="text-sm text-gray-500">No appointments yet.</p>}
          {appts.map((a) => (
            <div key={a.id} className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="font-medium">{a.doctor?.name} — {a.reason || 'Visit'}</p>
                <p className="text-sm text-gray-500">{new Date(a.scheduled_at).toLocaleString()} · {a.status}</p>
              </div>
              <div className="space-x-3 text-sm">
                {['pending', 'confirmed'].includes(a.status) && (
                  <Link to={`/patient/appointments/${a.id}/video`} className="text-green-600 hover:underline font-medium">
                    Join Video
                  </Link>
                )}
                {['pending', 'confirmed'].includes(a.status) && (
                  <button onClick={() => cancel(a.id)} className="text-red-600 hover:underline">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DoctorAppointments() {
  const { loading } = useAuth('doctor');
  const [appts, setAppts] = useState([]);

  const load = async () => {
    const res = await fetch(`${API_URL}/appointments`, { headers: headers() });
    if (res.ok) setAppts(await res.json());
  };

  useEffect(() => {
    if (loading) return;
    load();
    const socket = getSocket();
    socket.on('appointment:new', load);
    socket.on('appointment:updated', load);
    return () => {
      socket.off('appointment:new', load);
      socket.off('appointment:updated', load);
    };
  }, [loading]);

  const setStatus = async (id, status) => {
    await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ status }),
    });
    load();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex">
      <Sidebar role="doctor" />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Appointments</h1>
        <div className="bg-white p-6 rounded-lg shadow-md space-y-3">
          {appts.length === 0 && <p className="text-sm text-gray-500">No appointments yet.</p>}
          {appts.map((a) => (
            <div key={a.id} className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="font-medium">{a.patient?.name} — {a.reason || 'Visit'}</p>
                <p className="text-sm text-gray-500">{new Date(a.scheduled_at).toLocaleString()} · {a.status}</p>
              </div>
              <div className="space-x-2 text-sm">
                {['pending', 'confirmed'].includes(a.status) && (
                  <Link to={`/doctor/appointments/${a.id}/video`} className="text-green-600 hover:underline font-medium">
                    Join Video
                  </Link>
                )}
                {a.status === 'pending' && (
                  <>
                    <button onClick={() => setStatus(a.id, 'confirmed')} className="text-green-600 hover:underline">Confirm</button>
                    <button onClick={() => setStatus(a.id, 'cancelled')} className="text-red-600 hover:underline">Cancel</button>
                  </>
                )}
                {a.status === 'confirmed' && (
                  <button onClick={() => setStatus(a.id, 'completed')} className="text-blue-600 hover:underline">Complete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
