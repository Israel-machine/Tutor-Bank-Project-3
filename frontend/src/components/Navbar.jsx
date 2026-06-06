import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#ffffff',
    borderBottom: '2px solid #eee',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    height: '60px', 
    boxSizing: 'border-box'
  };

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>TutorBank</h2>
        <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontWeight: '500' }}>Caseload</Link>
        <Link to="/metrics" style={{ textDecoration: 'none', color: '#007bff', fontWeight: '500' }}>Metrics</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontWeight: 'bold', color: '#555' }}>
          User: {user?.username}
        </span>
        <button 
          onClick={logout} 
          style={{ 
            padding: '5px 12px', 
            cursor: 'pointer', 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #ccc',
            borderRadius: '4px' 
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}