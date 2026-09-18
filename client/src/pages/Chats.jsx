import Sidebar from '../components/Sidebar.jsx';
import ChatInterface from '../components/ChatInterface.jsx';
import { useAuth } from '../hooks/useAuth.js';

export function DoctorChat() {
  const { user, loading } = useAuth('doctor');
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return (
    <div className="flex">
      <Sidebar role="doctor" />
      <div className="flex-1">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Patient Conversations</h1>
          {user && <ChatInterface currentUserId={user.id} mode="doctor" />}
        </div>
      </div>
    </div>
  );
}

export function PatientChat() {
  const { user, loading } = useAuth('patient');
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return (
    <div className="flex">
      <Sidebar role="patient" />
      <div className="flex-1">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Doctor Conversations</h1>
          {user && <ChatInterface currentUserId={user.id} mode="patient" />}
        </div>
      </div>
    </div>
  );
}
