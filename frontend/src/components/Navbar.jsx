import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="nav-brand">TutorBank</h2>
        <Link to="/" className="nav-link">Caseload</Link>
        <Link to="/metrics" className="nav-link">Metrics</Link>
      </div>

      <div className="nav-right">
        <span className="nav-user">
          User: {user?.username}
        </span>
        <button onClick={logout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}