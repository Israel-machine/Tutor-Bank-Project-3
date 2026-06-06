import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page-box">
      <h2>TutorBank Sign Up</h2>
      {error && <p className="auth-text-error">{error}</p>}
      {success && <p className="auth-text-success">{error || 'Account created! Redirecting to login...'}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>New Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            className="auth-input-padding"
          />
        </div>
        <div>
          <label>New Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="auth-input-padding-lg"
          />
        </div>
        <button type="submit" className="auth-submit-btn-color">
          Create Account
        </button>
      </form>
      <p className="auth-footer-text">
        Already have an account? <Link to="/login">Return to Login</Link>
      </p>
    </div>
  );
}