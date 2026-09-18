import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { API_URL, getToken } from '../lib/api.js';
import Sidebar from '../components/Sidebar.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function VideoVisit({ role }) {
  useAuth(role);
  const { id } = useParams();
  const [appt, setAppt] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const headers = { Accept: 'application/json', Authorization: `Bearer ${getToken()}` };
    fetch(`${API_URL}/user`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => u && setUser(u));
    fetch(`${API_URL}/appointments/${id}`, { headers })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || 'Could not load appointment');
        setAppt(data);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const base = role === 'doctor' ? '/doctor' : '/patient';

  return (
    <div className="flex">
      <Sidebar role={role} />
      <div className="flex-1 p-6">
        <Link to={`${base}/appointments`} className="text-sm text-blue-600 hover:underline">
          ← Back to appointments
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-1">Video Visit</h1>
        {appt && (
          <p className="text-gray-600 mb-4">
            {appt.doctor?.name} with {appt.patient?.name} · {new Date(appt.scheduled_at).toLocaleString()} · {appt.status}
          </p>
        )}
        {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}
        {appt && ['cancelled'].includes(appt.status) && (
          <div className="p-3 mb-4 text-yellow-800 bg-yellow-100 rounded">
            This appointment was cancelled — video is disabled.
          </div>
        )}
        {appt && !error && appt.status !== 'cancelled' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '70vh' }}>
            <JitsiMeeting
              domain="meet.jit.si"
              roomName={appt.video_room}
              userInfo={{ displayName: user?.name || 'MediCare user', email: user?.email || '' }}
              configOverwrite={{ prejoinPageEnabled: true, startWithAudioMuted: false }}
              getIFrameRef={(node) => {
                if (node) node.style.height = '100%';
              }}
            />
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">
          Video is powered by free Jitsi Meet — camera/mic permission is requested by your browser. No account needed.
        </p>
      </div>
    </div>
  );
}
