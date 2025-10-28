import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const UserTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTickets = useCallback(async () => {
    try {
      const res = await axios.get('/tickets/my-tickets');
      setTickets(res.data || []);
    } catch (err) {
      // If unauthorized, do nothing; the route guard should protect access
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTickets();
    const interval = setInterval(fetchMyTickets, 30000);
    return () => clearInterval(interval);
  }, [fetchMyTickets]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Mes Tickets</h1>
          <p>Historique de vos demandes</p>
        </div>
        <a href="/" className="logout-btn">Nouveau ticket</a>
      </header>
      <div className="dashboard-content">
        <div className="tickets-list">
          <h2>Historique</h2>
          {loading ? (
            <p>Chargement...</p>
          ) : (tickets.length === 0 ? (
            <p className="empty">Aucun ticket</p>
          ) : (
            <div className="tickets-grid">
              {tickets.map((t) => (
                <div key={t.id} className="ticket-card">
                  <div className="ticket-header">
                    <h3>{t.title}</h3>
                    <span className="status-badge">{t.status}</span>
                  </div>
                  <p className="ticket-description">{t.description}</p>
                  <div className="ticket-info">
                    <p className="category">{t.category}</p>
                    <p className="priority">Priorité: {t.priority}</p>
                    <p className="ticket-date">Créé le: {t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR') : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserTickets;


