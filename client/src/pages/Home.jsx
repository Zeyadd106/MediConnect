import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">MediCare Chat Application</h1>
        <p className="mb-6">A secure platform for doctor-patient communication</p>
        <div className="space-x-4">
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
            Login
          </Link>
          <Link to="/register" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
