const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');
const sendEmailNotification = require('../utils/sendEmail');

const router = express.Router();

// Get all tickets (admin only)
router.get('/tickets', adminAuth, async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 }).populate('createdBy', 'name email');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update ticket status
router.put('/tickets/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    ticket.status = status;
    await ticket.save();

    // Send email to ticket creator
    await sendEmailNotification({
      to: req.user.email, // You might want to store user email in ticket
      subject: 'Mise à jour de votre ticket',
      text: `Votre ticket "${ticket.title}" a été mis à jour avec le statut: ${status}`
    });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update ticket with admin notes
router.put('/tickets/:id', adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete ticket
router.delete('/tickets/:id', adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    res.json({ message: 'Ticket supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;



