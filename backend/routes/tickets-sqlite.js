const express = require('express');
const Ticket = require('../models/Ticket');
const { auth } = require('../middleware/auth-sqlite');
const sendEmailNotification = require('../utils/sendEmail');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Upload configuration for attachments
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`.replace(/\s+/g, '_'));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 } // 10MB, max 5 files
});

// Helper function to escape HTML
const escapeHtml = (text) => {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

// Helper function to convert newlines to <br>
const nl2br = (text) => {
  if (!text) return '';
  return escapeHtml(text).replace(/\n/g, '<br>');
};

// Generate email HTML template
const generateEmailTemplate = (ticket, ticketData) => {
  const priorityColors = {
    'Urgente': { bg: '#ffebee', border: '#d32f2f', text: '#c62828', badge: '#d32f2f' },
    'Haute': { bg: '#fff3e0', border: '#f57c00', text: '#e65100', badge: '#f57c00' },
    'Moyenne': { bg: '#e3f2fd', border: '#0288d1', text: '#01579b', badge: '#0288d1' },
    'Faible': { bg: '#e8f5e9', border: '#388e3c', text: '#2e7d32', badge: '#388e3c' }
  };
  
  const priority = ticketData.priority || 'Moyenne';
  const priorityStyle = priorityColors[priority] || priorityColors['Moyenne'];
  const createdDate = ticket?.created_at ? new Date(ticket.created_at) : new Date();
  const formattedDate = createdDate.toLocaleString('fr-FR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau Ticket #${ticket?.id || 'N/A'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 35px 40px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600; letter-spacing: 0.5px;">
                                🎫 Nouveau Ticket Créé
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                                Système de Gestion de Tickets SEDI-ATI
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Ticket ID Badge -->
                            <div style="background: linear-gradient(135deg, ${priorityStyle.bg} 0%, ${priorityStyle.bg}dd 100%); border-left: 5px solid ${priorityStyle.border}; padding: 20px; border-radius: 6px; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                <h2 style="margin: 0; color: ${priorityStyle.text}; font-size: 32px; font-weight: 700; letter-spacing: 1px;">
                                    Ticket #${ticket?.id || 'N/A'}
                                </h2>
                                <p style="margin: 8px 0 0 0; color: ${priorityStyle.text}; font-size: 14px; font-weight: 500;">
                                    📅 Créé le ${formattedDate}
                                </p>
                            </div>
                            
                            <!-- Ticket Details Card -->
                            <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 0; margin-bottom: 25px; overflow: hidden;">
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0; background-color: #fafafa;">
                                            <strong style="color: #667eea; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Demandeur</strong>
                                        </td>
                                        <td style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0; text-align: right; background-color: #ffffff;">
                                            <span style="color: #333; font-size: 15px; font-weight: 600;">${escapeHtml(ticketData.createdByName || 'Utilisateur anonyme')}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0; background-color: #fafafa;">
                                            <strong style="color: #667eea; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Titre</strong>
                                        </td>
                                        <td style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0; text-align: right; background-color: #ffffff;">
                                            <span style="color: #333; font-size: 15px; font-weight: 600;">${escapeHtml(ticketData.title || 'Sans titre')}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0; background-color: #fafafa;">
                                            <strong style="color: #667eea; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Catégorie</strong>
                                        </td>
                                        <td style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0; text-align: right; background-color: #ffffff;">
                                            <span style="background-color: #e3f2fd; color: #1976d2; padding: 6px 14px; border-radius: 16px; font-size: 13px; font-weight: 600; display: inline-block;">${escapeHtml(ticketData.category || 'Général')}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 16px 20px; background-color: #fafafa;">
                                            <strong style="color: #667eea; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Priorité</strong>
                                        </td>
                                        <td style="padding: 16px 20px; text-align: right; background-color: #ffffff;">
                                            <span style="background-color: ${priorityStyle.bg}; color: ${priorityStyle.badge}; padding: 6px 14px; border-radius: 16px; font-size: 13px; font-weight: 700; border: 2px solid ${priorityStyle.border}; display: inline-block;">
                                                ${escapeHtml(priority)}
                                            </span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Description Section -->
                            <div style="background: linear-gradient(to bottom, #f9f9f9 0%, #ffffff 100%); padding: 25px; border-radius: 6px; margin-bottom: 30px; border: 1px solid #e8e8e8;">
                                <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center;">
                                    <span style="margin-right: 8px;">📝</span> Description
                                </h3>
                                <div style="color: #555; font-size: 14px; line-height: 1.7; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border-radius: 4px; border-left: 3px solid #667eea;">
                                    ${nl2br(ticketData.description || 'Aucune description fournie')}
                                </div>
                            </div>
                            
                            <!-- Action Buttons -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 10px 0 30px 0;">
                                        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;">
                                            <a href="${process.env.FRONTEND_URL || 'http://serveurtickets.sedi.local'}/admin" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s;">
                                                🔧 Accéder au Tableau de Bord
                                            </a>
                                            ${ticketData.trackingLink ? `
                                            <a href="${ticketData.trackingLink}" style="display: inline-block; background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(67, 206, 162, 0.4); transition: all 0.3s;">
                                                👤 Lien de Suivi Demandeur
                                            </a>` : ''}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Footer Note -->
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border: 1px solid #e9ecef; margin-top: 20px;">
                                <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center; line-height: 1.6;">
                                    <strong>ℹ️ Note:</strong> Cet email a été généré automatiquement par le système de gestion de tickets SEDI-ATI.<br>
                                    Connectez-vous à l'interface d'administration pour traiter ce ticket.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%); padding: 25px; border-radius: 0 0 8px 8px; text-align: center; border-top: 2px solid #eeeeee;">
                            <p style="margin: 0; color: #999; font-size: 12px; font-weight: 500;">
                                © ${new Date().getFullYear()} SEDI-ATI - Système de Gestion de Tickets
                            </p>
                            <p style="margin: 8px 0 0 0; color: #bbb; font-size: 11px;">
                                Tous droits réservés
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

// Preview email template (for testing - PUBLIC, no auth required)
router.get('/preview-email', (req, res) => {
  try {
    // Use query parameters or default values
    const ticketData = {
      title: req.query.title || 'Exemple de ticket de test',
      description: req.query.description || 'Ceci est une description d\'exemple pour tester le template d\'email.\n\nVous pouvez voir comment le texte s\'affiche avec plusieurs lignes.\n\nEt même avec des caractères spéciaux: <>&"\'',
      priority: req.query.priority || 'Moyenne',
      category: req.query.category || 'Technique',
      createdByName: req.query.createdByName || 'Jean Dupont'
    };

    const mockTicket = {
      id: req.query.ticketId || '999',
      created_at: new Date().toISOString()
    };

    const htmlEmail = generateEmailTemplate(mockTicket, ticketData);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlEmail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create ticket (NO AUTH REQUIRED - Public, with optional attachments)
router.post('/', upload.array('attachments', 5), (req, res) => {
  try {
    const ticket = Ticket.create({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || 'Moyenne',
      category: req.body.category || 'Général',
      created_by: null,
      created_by_name: req.body.createdByName || 'Utilisateur anonyme'
    });

    // Save attachments if any
    if (req.files && req.files.length > 0 && ticket.id) {
      Ticket.addFiles(ticket.id, req.files, req.body.createdByName || 'Demandeur public');
    }

    const trackingLink = `${process.env.FRONTEND_URL || 'http://serveurtickets.sedi.local'}/track/${ticket.id}?token=${ticket.tracking_token}`;

    // Prepare ticket data for email
    const ticketData = {
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || 'Moyenne',
      category: req.body.category || 'Général',
      createdByName: req.body.createdByName || 'Utilisateur anonyme',
      trackingLink
    };

    // Generate email HTML template
    const htmlEmail = generateEmailTemplate(ticket, ticketData);
    
    // Generate plain text version
    const textEmail = `Nouveau ticket créé

Demandeur: ${ticketData.createdByName}
Email demandeur: ${req.body.email || 'Non renseigné'}
Titre: ${ticketData.title}
Description: ${ticketData.description}
Catégorie: ${ticketData.category}
Priorité: ${ticketData.priority}
ID: #${ticket.id || 'N/A'}
Date: ${new Date().toLocaleString('fr-FR')}
Suivi: ${trackingLink}

Connectez-vous à l'interface admin pour traiter ce ticket.`;
    
    // Send email notification (with optional CC)
    sendEmailNotification({
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: `🎫 Nouveau ticket #${ticket.id || 'N/A'} - ${req.body.title}`,
      text: textEmail,
      html: htmlEmail,
      // On met en copie l'email du demandeur (s'il est renseigné),
      // en plus des éventuelles adresses définies par TICKET_CC_EMAILS
      cc: req.body.email || undefined
    });

    res.status(201).json({
      ...ticket,
      trackingLink
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ticket by ID for tracking (public, no auth)
router.get('/track/:id', (req, res) => {
  try {
    const { token } = req.query;
    const rawToken = Array.isArray(token) ? token[0] : token;
    const normalizedToken = String(rawToken || '').trim();

    if (!normalizedToken) {
      return res.status(400).json({ message: 'Token de suivi requis' });
    }

    const ticket = Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    const storedToken = String(ticket.tracking_token || '').trim();

    if (!storedToken || storedToken !== normalizedToken) {
      console.warn('Tracking token mismatch', {
        ticketId: ticket.id,
        storedTokenStart: storedToken.substring(0, 8),
        receivedTokenStart: normalizedToken.substring(0, 8)
      });
      return res.status(403).json({ message: 'Token invalide' });
    }

    if (ticket.tracking_token_expires && new Date(ticket.tracking_token_expires) < new Date()) {
      return res.status(403).json({ message: 'Token expiré, veuillez demander un nouveau lien' });
    }
    const attachments = Ticket.getFiles(ticket.id).map(f => ({
      ...f,
      url: `/uploads/${f.filename}`
    }));
    res.json({ ...ticket, attachments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel ticket via tracking token (public)
router.post('/track/:id/cancel', (req, res) => {
  try {
    const { token, reason } = req.body || {};
    if (!token) {
      return res.status(400).json({ message: 'Token de suivi requis' });
    }

    const ticket = Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    if (!ticket.tracking_token || ticket.tracking_token !== token) {
      return res.status(403).json({ message: 'Token invalide' });
    }
    if (ticket.tracking_token_expires && new Date(ticket.tracking_token_expires) < new Date()) {
      return res.status(403).json({ message: 'Token expiré, impossible d\'annuler cette demande.' });
    }
    if (ticket.status === 'Annulé') {
      return res.status(400).json({ message: 'Ce ticket est déjà annulé.' });
    }

    const updated = Ticket.update(ticket.id, {
      status: 'Annulé',
      canceled_at: new Date().toISOString(),
      canceled_reason: reason || ''
    });

    return res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's tickets
router.get('/my-tickets', auth, (req, res) => {
  try {
    const tickets = Ticket.findByUser(req.user.id);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single ticket
router.get('/:id', auth, (req, res) => {
  try {
    const ticket = Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    // Check if user has permission to view this ticket
    if (req.user.role !== 'admin' && ticket.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

