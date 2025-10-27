const express = require('express');
const Ticket = require('../models/Ticket');
const { auth } = require('../middleware/auth');
const sendEmailNotification = require('../utils/sendEmail');

const router = express.Router();

// Create ticket (NO AUTH REQUIRED - Public)
router.post('/', async (req, res) => {
  try {
    const ticket = new Ticket({
      ...req.body,
      createdBy: null, // No user required
      createdByName: req.body.createdByName || 'Utilisateur anonyme'
    });

    await ticket.save();
    
    // Send email notification
    await sendEmailNotification({
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: 'Nouveau ticket créé',
      text: `Un nouveau ticket a été créé par ${req.body.createdByName || 'Utilisateur anonyme'}: ${ticket.title}`
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's tickets
router.get('/my-tickets', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single ticket
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    // Check if user has permission to view this ticket
    if (req.user.role !== 'admin' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

