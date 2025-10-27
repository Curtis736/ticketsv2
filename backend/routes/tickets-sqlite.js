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

    // Send email notification
    sendEmailNotification({
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: 'Nouveau ticket créé',
      text: `Un nouveau ticket a été créé par ${req.body.createdByName || 'Utilisateur anonyme'}: ${req.body.title}`
    });

    res.status(201).json(ticket);
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

