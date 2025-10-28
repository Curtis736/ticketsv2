import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './TicketTracking.css';

const TicketTracking = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`/tickets/track/${id}`);
      setTicket(res.data);
    } catch (err) {
      setError('Ticket non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Ouvert': '#2196F3',
      'En cours': '#FF9800',
      'Résolu': '#4CAF50',
      'Fermé': '#9E9E9E'
    };
    return colors[status] || '#999';
  };

  if (loading) {
    return (
      <div className="tracking-container">
        <div className="tracking-content">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="tracking-container">
        <div className="tracking-content">
          <h1>📋 Suivi de ticket</h1>
          <p className="error">{error || 'Ticket non trouvé'}</p>
          <button onClick={() => navigate('/')} className="btn-home">Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-container">
      <header className="tracking-header">
        <h1>📋 Suivi de ticket</h1>
        <button
          onClick={() => {
            // Ouvre le formulaire dans un nouvel onglet et garde cette page ouverte
            window.open('/', '_blank');
          }}
          className="btn-home"
        >
          🏠 Accueil
        </button>
      </header>

      <div className="tracking-content">
        <div className="tracking-card">
          <div className="ticket-header">
            <h2>{ticket.title}</h2>
            <span className="status-badge" style={{ backgroundColor: getStatusColor(ticket.status) }}>
              {ticket.status}
            </span>
          </div>

          <div className="ticket-info">
            <p><strong>ID:</strong> #{ticket.id}</p>
            <p><strong>Créé par:</strong> {ticket.created_by_name || 'Utilisateur anonyme'}</p>
            <p><strong>Catégorie:</strong> {ticket.category}</p>
            <p><strong>Priorité:</strong> {ticket.priority}</p>
            <p><strong>Créé le:</strong> {new Date(ticket.created_at).toLocaleDateString('fr-FR')}</p>
          </div>

          <div className="ticket-description">
            <h3>Description</h3>
            <p>{ticket.description}</p>
          </div>

          {ticket.admin_notes && (
            <div className="admin-notes">
              <h3>Notes d'administration</h3>
              <p>{ticket.admin_notes}</p>
            </div>
          )}

          <div className="ticket-actions">
            <button
              onClick={() => {
                // Ouvre le formulaire dans un nouvel onglet et garde la page de statut ouverte
                window.open('/', '_blank');
              }}
              className="btn-new-ticket"
            >
              Créer un nouveau ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketTracking;

