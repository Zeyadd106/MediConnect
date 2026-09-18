import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { DoctorDashboard, PatientDashboard } from './pages/Dashboards.jsx';
import { DoctorChat, PatientChat } from './pages/Chats.jsx';
import { DoctorAppointments, PatientAppointments } from './pages/Appointments.jsx';
import VideoVisit from './pages/VideoVisit.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/chat" element={<DoctorChat />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/appointments/:id/video" element={<VideoVisit role="doctor" />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/chat" element={<PatientChat />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/appointments/:id/video" element={<VideoVisit role="patient" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
