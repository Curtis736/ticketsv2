import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PublicTicketForm.css';

const PublicTicketForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Général',
    priority: 'Moyenne',
    createdByName: '',
    email: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [files, setFiles] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Charger les derniers tickets suivables depuis le navigateur
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentTickets');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentTickets(parsed);
        }
      }
    } catch (e) {
      // ignore JSON errors
    }
  }, []);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });
    setTrackingInfo(null);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('createdByName', formData.createdByName);
      if (formData.email) {
        data.append('email', formData.email);
      }
      files.forEach((file) => {
        data.append('attachments', file);
      });

      const response = await axios.post('/tickets', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setCreatedTicketId(response.data.id);
      setTrackingInfo({
        link: response.data.trackingLink,
        token: response.data.tracking_token
      });

      // Sauvegarder ce ticket dans l'historique local du navigateur
      const newTicket = {
        id: response.data.id,
        link: response.data.trackingLink,
        title: formData.title,
        createdAt: new Date().toISOString()
      };
      const updatedRecent = [newTicket, ...recentTickets].slice(0, 5);
      setRecentTickets(updatedRecent);
      try {
        localStorage.setItem('recentTickets', JSON.stringify(updatedRecent));
      } catch (e) {
        // stockage local non critique
      }
      setMessage({ 
        text: `✅ Ticket créé avec succès! ID: #${response.data.id}`, 
        type: 'success' 
      });
      setFormData({
        title: '',
        description: '',
        category: 'Général',
        priority: 'Moyenne',
        createdByName: '',
        email: ''
      });
      setFiles([]);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Erreur lors de la création du ticket', 
        type: 'error' 
      });
      setTrackingInfo(null);
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

        {recentTickets.length > 0 && (
          <div className="info-box recent-tickets-box">
            <h3>📋 Suivre vos dernières demandes</h3>
            <p className="recent-tickets-subtitle">
              Ces liens sont enregistrés uniquement dans ce navigateur.
            </p>
            <div className="recent-tickets-list">
              {recentTickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="recent-ticket-pill"
                  onClick={() => window.open(t.link, '_blank')}
                >
                  <span className="recent-ticket-id">Ticket #{t.id}</span>
                  {t.title && <span className="recent-ticket-title">{t.title}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="public-ticket-form">
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
              {trackingInfo?.link && (
                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => window.open(trackingInfo.link, '_blank')}
                    className="track-btn"
                  >
                    📋 Suivre mon ticket
                  </button>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    Vous pouvez enregistrer ce lien sécurisé pour suivre l'avancement de votre demande.
                  </p>
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
            <label>Votre email (pour recevoir une copie, optionnel)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="vous@exemple.com"
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

          <div className="form-group">
            <label>Pièces jointes (optionnel)</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xlsx"
            />
            {files.length > 0 && (
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {files.length} fichier(s) sélectionné(s)
              </p>
            )}
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



