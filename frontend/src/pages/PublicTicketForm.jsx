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
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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



