const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth-sqlite');
const sendEmailNotification = require('../utils/sendEmail');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Reuse same uploads directory as public route
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
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }
});

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

    // Send email notification (with optional CC)
    sendEmailNotification({
      to: process.env.ADMIN_EMAIL,
      subject: 'Mise à jour de votre ticket',
      text: `Le ticket "${ticket.title}" a été mis à jour avec le statut: ${status}`,
      cc: undefined
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

// Upload attachments for a ticket (admin)
router.post('/tickets/:id/attachments', adminAuth, upload.array('attachments', 5), (req, res) => {
  try {
    const ticket = Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    if (req.files && req.files.length > 0) {
      const uploadedBy = req.user?.name || req.user?.email || 'Admin';
      Ticket.addFiles(ticket.id, req.files, uploadedBy);
    }

    const attachments = Ticket.getFiles(ticket.id).map(f => ({
      ...f,
      url: `/uploads/${f.filename}`
    }));

    res.json({ attachments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attachments for a ticket (admin)
router.get('/tickets/:id/attachments', adminAuth, (req, res) => {
  try {
    // Même si le ticket est supprimé, on renvoie simplement la liste des pièces jointes (souvent vide)
    const attachments = Ticket.getFiles(req.params.id).map(f => ({
      ...f,
      url: `/uploads/${f.filename}`
    }));
    res.json({ attachments });
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
