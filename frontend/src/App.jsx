import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Lazy load components for better performance
const Login = lazy(() => import('./pages/Login'));
const PublicTicketForm = lazy(() => import('./pages/PublicTicketForm'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

axios.defaults.baseURL = '/api';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    axios.defaults.headers.common['Authorization'] = '';
  };

  return (
    <Router>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>}>
        <Routes>
          <Route path="/" element={<PublicTicketForm />} />
          <Route path="/login" element={user ? <Navigate to="/admin" /> : <Login onLogin={login} />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard user={user} onLogout={logout} /> : <Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

