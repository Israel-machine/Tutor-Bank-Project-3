import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token invalid or expired');
        return res.json();
      })
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        localStorage.removeItem('token'); 
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Handle Login
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // Handle Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}