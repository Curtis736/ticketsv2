const express = require('express');
const Ticket = require('../models/Ticket');
const { auth } = require('../middleware/auth-sqlite');
const sendEmailNotification = require('../utils/sendEmail');

const router = express.Router();

// Create ticket (NO AUTH REQUIRED - Public)
router.post('/', (req, res) => {
  try {
    const ticket = Ticket.create({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || 'Moyenne',
      category: req.body.category || 'Général',
      created_by: null,
      created_by_name: req.body.createdByName || 'Utilisateur anonyme'
    });

    // Send email notification to admin with beautiful HTML template
    const priorityColors = {
      'Urgente': '#d32f2f',
      'Haute': '#f57c00',
      'Moyenne': '#0288d1',
      'Faible': '#388e3c'
    };
    const priorityColor = priorityColors[req.body.priority] || '#0288d1';
    
    const htmlEmail = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau Ticket</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 40px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                🎫 Nouveau Ticket Créé
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Ticket ID Badge -->
                            <div style="background-color: #f0f4ff; border-left: 4px solid ${priorityColor}; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
                                <h2 style="margin: 0; color: #333; font-size: 28px; font-weight: 700;">
                                    Ticket #${ticket.id || 'N/A'}
                                </h2>
                                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                                    ${new Date().toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            
                            <!-- Ticket Details -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                                        <strong style="color: #667eea; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Demandeur</strong>
                                    </td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right;">
                                        <span style="color: #333; font-size: 15px; font-weight: 500;">${req.body.createdByName || 'Utilisateur anonyme'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                                        <strong style="color: #667eea; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Titre</strong>
                                    </td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right;">
                                        <span style="color: #333; font-size: 15px; font-weight: 500;">${req.body.title}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                                        <strong style="color: #667eea; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Catégorie</strong>
                                    </td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right;">
                                        <span style="background-color: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;">${req.body.category}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <strong style="color: #667eea; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Priorité</strong>
                                    </td>
                                    <td style="padding: 12px 0; text-align: right;">
                                        <span style="background-color: ${priorityColor}20; color: ${priorityColor}; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; border: 1px solid ${priorityColor}40;">
                                            ${req.body.priority}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Description -->
                            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                                <h3 style="margin: 0 0 12px 0; color: #667eea; font-size: 16px; font-weight: 600;">Description</h3>
                                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${req.body.description}</p>
                            </div>
                            
                            <!-- Action Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="${process.env.FRONTEND_URL || 'https://sedi-tickets.sedi-ati.com'}/admin" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);">
                                            🔧 Accéder au Tableau de Bord
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Footer Note -->
                            <p style="margin: 25px 0 0 0; color: #999; font-size: 12px; text-align: center; line-height: 1.5;">
                                Cet email a été généré automatiquement par le système de gestion de tickets SEDI-ATI.<br>
                                Connectez-vous à l'interface d'administration pour traiter ce ticket.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #fafafa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #999; font-size: 12px;">
                                © ${new Date().getFullYear()} SEDI-ATI - Système de Gestion de Tickets
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    
    const textEmail = `Nouveau ticket créé\n\nDemandeur: ${req.body.createdByName || 'Utilisateur anonyme'}\nTitre: ${req.body.title}\nDescription: ${req.body.description}\nCatégorie: ${req.body.category}\nPriorité: ${req.body.priority}\nID: #${ticket.id || 'N/A'}\nDate: ${new Date().toLocaleString('fr-FR')}\n\nConnectez-vous à l'interface admin pour traiter ce ticket.`;
    
    sendEmailNotification({
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: `🎫 Nouveau ticket #${ticket.id || 'N/A'} - ${req.body.title}`,
      text: textEmail,
      html: htmlEmail
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ticket by ID for tracking (public, no auth)
router.get('/track/:id', (req, res) => {
  try {
    const ticket = Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    res.json(ticket);
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

