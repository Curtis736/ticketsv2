import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import './TicketTracking.css';

const TicketTracking = () => {
  const { id } = useParams();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState('');
  const navigate = useNavigate();

  const token = new URLSearchParams(location.search).get('token');

  const fetchTicket = useCallback(async (silent = false) => {
    if (!token) {
      setError('Lien de suivi invalide ou manquant.');
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`/tickets/track/${id}`, {
        params: { token }
      });
      setTicket(res.data);
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || 'Ticket non trouvé';
      setError(message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [id, token]);

  useEffect(() => {
    fetchTicket(false); // Premier chargement avec loading
    
    if (!token) {
      return;
    }

    // Rafraîchir automatiquement toutes les 30 secondes pour voir les mises à jour
    const interval = setInterval(() => {
      fetchTicket(true); // Rafraîchissement silencieux sans afficher le loading
    }, 30000); // 30 secondes
    
    return () => clearInterval(interval);
  }, [fetchTicket, token]);

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

          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="ticket-description">
              <h3>Pièces jointes</h3>
              <ul>
                {ticket.attachments.map((file) => (
                  <li key={file.id}>
                    <a href={file.url} target="_blank" rel="noreferrer">
                      {file.original_name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ticket.admin_notes && (
            <div className="admin-notes">
              <h3>Notes d'administration</h3>
              <p>{ticket.admin_notes}</p>
            </div>
          )}

          <div className="ticket-actions">
            {ticket.status !== 'Annulé' && (
              <button
                onClick={async () => {
                  const confirmCancel = window.confirm('Êtes-vous sûr de vouloir annuler cette demande ?');
                  if (!confirmCancel || !token) return;

                  const reason = window.prompt('Vous pouvez indiquer un motif (optionnel) :', '');
                  setCancelLoading(true);
                  setCancelSuccess('');
                  try {
                    const res = await axios.post(`/tickets/track/${ticket.id}/cancel`, {
                      token,
                      reason: reason || ''
                    });
                    setTicket(res.data);
                    setCancelSuccess('Votre demande a été annulée avec succès.');
                  } catch (err) {
                    const msg = err.response?.data?.message || 'Erreur lors de l\'annulation.';
                    setError(msg);
                  } finally {
                    setCancelLoading(false);
                  }
                }}
                disabled={cancelLoading}
                className="btn-home"
              >
                {cancelLoading ? 'Annulation en cours...' : 'Annuler cette demande'}
              </button>
            )}
            {cancelSuccess && (
              <p style={{ marginTop: '0.5rem', color: '#4CAF50' }}>{cancelSuccess}</p>
            )}
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

