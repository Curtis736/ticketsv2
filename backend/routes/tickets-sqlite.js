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

    // Send email notification to admin
    sendEmailNotification({
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: 'Nouveau ticket créé - #' + ticket.id,
      text: `Nouveau ticket créé\n\nDemandeur: ${req.body.createdByName || 'Utilisateur anonyme'}\nTitre: ${req.body.title}\nDescription: ${req.body.description}\nCatégorie: ${req.body.category}\nPriorité: ${req.body.priority}\nID: #${ticket.id || 'N/A'}\nDate: ${new Date().toLocaleString('fr-FR')}\n\nConnectez-vous à l'interface admin pour traiter ce ticket.`
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

