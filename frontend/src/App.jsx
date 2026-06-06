// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StudentDetails from './pages/StudentDetails';
import Metrics from './pages/Metrics';
import ProtectedRoute from './components/ProtectedRoute'; // Ensure filename matches
import Navbar from './components/Navbar'; // Import your new shared ribbon

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/students/:id" element={
          <ProtectedRoute>
            <Navbar />
            <StudentDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/metrics" element={
          <ProtectedRoute>
            <Navbar />
            <Metrics />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;