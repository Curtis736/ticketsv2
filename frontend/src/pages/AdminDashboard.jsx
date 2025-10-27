import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updateData, setUpdateData] = useState({ status: '', adminNotes: '' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('/admin/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const ticketId = selectedTicket.id || selectedTicket._id;
      await axios.put(`/admin/tickets/${ticketId}`, {
        status: updateData.status || selectedTicket.status,
        adminNotes: updateData.adminNotes,
        priority: selectedTicket.priority
      });
      setSelectedTicket(null);
      setUpdateData({ status: '', adminNotes: '' });
      fetchTickets();
      alert('Ticket mis à jour avec succès!');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await axios.put(`/admin/tickets/${ticketId}/status`, { status: newStatus });
      fetchTickets();
      // Pas besoin d'alerte pour chaque changement de statut
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
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

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Administration</h1>
          <p>Admin: {user.name}</p>
        </div>
        <button onClick={onLogout} className="logout-btn">Déconnexion</button>
      </header>

      <div className="dashboard-content">
        <div className="admin-filters">
          <button 
            className={filter === 'all' ? 'filter-active' : ''} 
            onClick={() => setFilter('all')}
          >
            Tous ({tickets.length})
          </button>
          <button 
            className={filter === 'Ouvert' ? 'filter-active' : ''} 
            onClick={() => setFilter('Ouvert')}
          >
            Ouverts ({tickets.filter(t => t.status === 'Ouvert').length})
          </button>
          <button 
            className={filter === 'En cours' ? 'filter-active' : ''} 
            onClick={() => setFilter('En cours')}
          >
            En cours ({tickets.filter(t => t.status === 'En cours').length})
          </button>
          <button 
            className={filter === 'Résolu' ? 'filter-active' : ''} 
            onClick={() => setFilter('Résolu')}
          >
            Résolus ({tickets.filter(t => t.status === 'Résolu').length})
          </button>
        </div>

        <div className="tickets-list">
          <h2>Tous les Tickets</h2>
          {loading ? (
            <p>Chargement...</p>
          ) : filteredTickets.length === 0 ? (
            <p className="empty">Aucun ticket</p>
          ) : (
            <div className="tickets-grid">
              {filteredTickets.map(ticket => {
                const ticketId = ticket.id || ticket._id;
                const createdAt = ticket.created_at || ticket.createdAt;
                return (
                  <div 
                    key={ticketId} 
                    className="ticket-card admin-card"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="ticket-header">
                      <h3>{ticket.title}</h3>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(ticket.status) }}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="ticket-info">
                      <p><strong>Demandeur:</strong> {ticket.creator_name || ticket.created_by_name || ticket.createdByName || 'Utilisateur anonyme'}</p>
                      {ticket.creator_email && <p><strong>Email:</strong> {ticket.creator_email}</p>}
                      <p className="category">{ticket.category}</p>
                      <p className="priority">Priorité: {ticket.priority}</p>
                    </div>
                    <p className="ticket-description">{ticket.description}</p>
                    {ticket.admin_notes && (
                      <p className="admin-notes"><strong>Notes admin:</strong> {ticket.admin_notes}</p>
                    )}
                    <p className="ticket-date">
                      Créé le: {createdAt ? new Date(createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                    </p>
                    <div className="quick-actions">
                      <select 
                        value={ticket.status} 
                        onChange={(e) => handleStatusChange(ticketId, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option>Ouvert</option>
                        <option>En cours</option>
                        <option>Résolu</option>
                        <option>Fermé</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Modifier le ticket</h2>
            <div className="form-group">
              <label>Statut</label>
              <select 
                value={updateData.status || selectedTicket.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
              >
                <option>Ouvert</option>
                <option>En cours</option>
                <option>Résolu</option>
                <option>Fermé</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes d'administration</label>
              <textarea
                value={updateData.adminNotes || selectedTicket.adminNotes}
                onChange={(e) => setUpdateData({ ...updateData, adminNotes: e.target.value })}
                rows="4"
                placeholder="Ajouter des notes ou commentaires..."
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleUpdate} className="btn-primary">Sauvegarder</button>
              <button onClick={() => setSelectedTicket(null)} className="btn-secondary">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

