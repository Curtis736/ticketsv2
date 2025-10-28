import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PublicTicketForm.css';

const PublicTicketForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Général',
    priority: 'Moyenne',
    createdByName: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post('/tickets', formData);
      setCreatedTicketId(response.data.id);
      setMessage({ 
        text: `✅ Ticket créé avec succès! ID: #${response.data.id}`, 
        type: 'success' 
      });
      setFormData({
        title: '',
        description: '',
        category: 'Général',
        priority: 'Moyenne',
        createdByName: ''
      });
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Erreur lors de la création du ticket', 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToAdmin = () => {
    navigate('/login');
  };

  return (
    <div className="public-container">
      <header className="public-header">
        <h1>🎫 Système de Demandes</h1>
        <button onClick={navigateToAdmin} className="admin-link">
          👤 Espace Admin
        </button>
      </header>

      <div className="public-content">
        <div className="info-box">
          <h2>Créez votre demande</h2>
          <p>Remplissez le formulaire ci-dessous pour créer un ticket de demande. Notre équipe vous répondra rapidement.</p>
        </div>

        <form onSubmit={handleSubmit} className="public-ticket-form">
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
              {createdTicketId && (
                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/track/${createdTicketId}`)}
                    className="track-btn"
                  >
                    📋 Suivre mon ticket
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Votre nom *</label>
            <input
              type="text"
              name="createdByName"
              value={formData.createdByName}
              onChange={handleChange}
              placeholder="Entrez votre nom"
              required
            />
          </div>

          <div className="form-group">
            <label>Titre de la demande *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Problème avec le serveur"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Catégorie</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option>Général</option>
                <option>Technique</option>
                <option>Administratif</option>
                <option>Finance</option>
                <option>Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priorité</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option>Faible</option>
                <option>Moyenne</option>
                <option>Haute</option>
                <option>Urgente</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              placeholder="Décrivez votre demande en détail..."
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
          </button>
        </form>
      </div>

      <footer className="public-footer">
        <p>© 2025 - Système de Gestion de Tickets</p>
      </footer>
    </div>
  );
};

export default PublicTicketForm;



