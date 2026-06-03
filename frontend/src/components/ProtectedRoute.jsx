import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait for the backend /me token validation request to finish
  if (loading) {
    return <div>Loading your session...</div>;
  }

  // If no user is logged in, redirect them to login page safely
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}