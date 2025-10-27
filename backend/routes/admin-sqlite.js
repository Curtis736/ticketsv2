const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth-sqlite');
const sendEmailNotification = require('../utils/sendEmail');

const router = express.Router();

// Get all tickets (admin only)
router.get('/tickets', adminAuth, (req, res) => {
  try {
    const tickets = Ticket.findAll();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin only)
router.get('/users', adminAuth, (req, res) => {
  try {
    const users = User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update ticket status
router.put('/tickets/:id/status', adminAuth, (req, res) => {
  try {
    const { status } = req.body;
    const ticket = Ticket.update(req.params.id, { status });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    // Send email notification
    sendEmailNotification({
      to: process.env.ADMIN_EMAIL,
      subject: 'Mise à jour de votre ticket',
      text: `Le ticket "${ticket.title}" a été mis à jour avec le statut: ${status}`
    });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update ticket with admin notes
router.put('/tickets/:id', adminAuth, (req, res) => {
  try {
    const ticket = Ticket.update(req.params.id, req.body);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete ticket
router.delete('/tickets/:id', adminAuth, (req, res) => {
  try {
    const result = Ticket.delete(req.params.id);

    res.json({ message: 'Ticket supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
