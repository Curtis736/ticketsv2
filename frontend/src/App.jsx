import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PublicTicketForm from './pages/PublicTicketForm';
import AdminDashboard from './pages/AdminDashboard';
import axios from 'axios';

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
      <Routes>
        <Route path="/" element={<PublicTicketForm />} />
        <Route path="/login" element={user ? <Navigate to="/admin" /> : <Login onLogin={login} />} />
        <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard user={user} onLogout={logout} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

