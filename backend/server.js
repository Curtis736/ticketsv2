const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('./database-sqljs'); // Initialize database

dotenv.config();

const app = express();

// Trust proxy for rate limiting behind nginx/proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Compression middleware
app.use(compression());

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// More strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.'
});
app.use('/api/auth/login', authLimiter);

// More lenient rate limiting for public tickets
const ticketLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // allow more requests for ticket creation
  message: 'Trop de demandes, veuillez patienter quelques minutes.'
});
app.use('/api/tickets', ticketLimiter);

// Static files for uploads (attachments)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth-sqlite'));
app.use('/api/tickets', require('./routes/tickets-sqlite'));
app.use('/api/admin', require('./routes/admin-sqlite'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// SQLite (sql.js) database will be ready after a brief moment

// Utiliser un port dédié pour le backend afin d'éviter les conflits
// avec une éventuelle variable d'environnement PORT globale (par ex. outils Windows)
const PORT = process.env.BACKEND_PORT || 5050;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: tickets.db`);
});
