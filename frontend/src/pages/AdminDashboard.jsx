import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css';

// Date par défaut : premier jour du mois courant (pour le suivi des résolus)
const getDefaultResolvedSince = () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return firstDayOfMonth.toISOString().slice(0, 10); // format YYYY-MM-DD pour l’input date
};

const AdminDashboard = ({ user, onLogout }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updateData, setUpdateData] = useState({ status: '', adminNotes: '' });
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [resolvedSince, setResolvedSince] = useState(getDefaultResolvedSince);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await axios.get('/admin/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttachments = useCallback(async (ticketId) => {
    try {
      const res = await axios.get(`/admin/tickets/${ticketId}/attachments`);
      setAttachments(res.data.attachments || []);
    } catch (err) {
      console.error('Error fetching attachments:', err);
      setAttachments([]);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const handleUpdate = useCallback(async () => {
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
  }, [selectedTicket, updateData, fetchTickets]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await axios.put(`/admin/tickets/${ticketId}/status`, { status: newStatus });
      fetchTickets();
      // Pas besoin d'alerte pour chaque changement de statut
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
      return;
    }
    try {
      await axios.delete(`/admin/tickets/${ticketId}`);
      fetchTickets();
      alert('Ticket supprimé avec succès');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
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

  // Memoize filtered tickets to avoid unnecessary recalculation
  const filteredTickets = useMemo(() => {
    // Pour "Résolus", on veut un vrai suivi des tickets terminés depuis une certaine date
    if (filter === 'Résolu') {
      const sinceDate = resolvedSince ? new Date(resolvedSince) : null;
      const resolvedStatuses = ['Résolu', 'Fermé'];

      return tickets.filter((t) => {
        if (!resolvedStatuses.includes(t.status)) {
          return false;
        }
        if (!sinceDate) return true;

        const updatedAt = t.updated_at || t.updatedAt || t.created_at || t.createdAt;
        if (!updatedAt) return true;

        const ticketDate = new Date(updatedAt);
        return ticketDate >= sinceDate;
      });
    }

    return filter === 'all'
      ? tickets
      : tickets.filter((t) => t.status === filter);
  }, [tickets, filter, resolvedSince]);

  // Memoize status counts (en cohérence avec le filtre "Résolus" + date)
  const statusCounts = useMemo(() => {
    const sinceDate = resolvedSince ? new Date(resolvedSince) : null;
    const resolvedStatuses = ['Résolu', 'Fermé'];

    return {
      all: tickets.length,
      Ouvert: tickets.filter((t) => t.status === 'Ouvert').length,
      'En cours': tickets.filter((t) => t.status === 'En cours').length,
      Résolu: tickets.filter((t) => {
        if (!resolvedStatuses.includes(t.status)) return false;
        if (!sinceDate) return true;
        const updatedAt = t.updated_at || t.updatedAt || t.created_at || t.createdAt;
        if (!updatedAt) return true;
        const ticketDate = new Date(updatedAt);
        return ticketDate >= sinceDate;
      }).length,
    };
  }, [tickets, resolvedSince]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Administration</h1>
          <p>Admin: {user.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => {
              // Use relative URL to work with the API proxy
              const previewUrl = '/api/tickets/preview-email';
              window.open(previewUrl, '_blank', 'width=800,height=900,scrollbars=yes');
            }}
            className="preview-btn"
            style={{
              padding: '0.5rem 1rem',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            📧 Prévisualiser l'email
          </button>
          <button onClick={onLogout} className="logout-btn">Déconnexion</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="admin-filters">
          <button 
            className={filter === 'all' ? 'filter-active' : ''} 
            onClick={() => setFilter('all')}
          >
            Tous ({statusCounts.all})
          </button>
          <button 
            className={filter === 'Ouvert' ? 'filter-active' : ''} 
            onClick={() => setFilter('Ouvert')}
          >
            Ouverts ({statusCounts.Ouvert})
          </button>
          <button 
            className={filter === 'En cours' ? 'filter-active' : ''} 
            onClick={() => setFilter('En cours')}
          >
            En cours ({statusCounts['En cours']})
          </button>
          <button 
            className={filter === 'Résolu' ? 'filter-active' : ''} 
            onClick={() => setFilter('Résolu')}
          >
            Résolus ({statusCounts.Résolu})
          </button>
        </div>

        {filter === 'Résolu' && (
          <div className="resolved-filter" style={{ margin: '0.5rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontWeight: 500 }}>
              Tickets terminés depuis le :
            </label>
            <input
              type="date"
              value={resolvedSince}
              onChange={(e) => setResolvedSince(e.target.value)}
              style={{ padding: '0.25rem 0.5rem' }}
            />
          </div>
        )}

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
                    onClick={() => {
                      setSelectedTicket(ticket);
                      fetchAttachments(ticketId);
                    }}
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
                      <button 
                        className="btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(ticketId);
                        }}
                      >
                        Supprimer
                      </button>
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
            <div className="form-group">
              <label>Pièces jointes</label>
              <input
                type="file"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;
                  const ticketId = selectedTicket.id || selectedTicket._id;
                  const data = new FormData();
                  files.forEach((file) => data.append('attachments', file));
                  setUploading(true);
                  try {
                    const res = await axios.post(`/admin/tickets/${ticketId}/attachments`, data, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    setAttachments(res.data.attachments || []);
                  } catch (err) {
                    alert(err.response?.data?.message || 'Erreur lors de l\'upload des pièces jointes');
                  } finally {
                    setUploading(false);
                    e.target.value = '';
                  }
                }}
              />
              {uploading && <p>Upload en cours...</p>}
              {attachments.length > 0 && (
                <ul style={{ marginTop: '0.5rem' }}>
                  {attachments.map((file) => (
                    <li key={file.id}>
                      <a href={file.url} target="_blank" rel="noreferrer">
                        {file.original_name}
                      </a>{' '}
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>
                        ({file.uploaded_by})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
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

