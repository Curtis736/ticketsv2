const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
require('./database-sqljs'); // Initialize database

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth-sqlite'));
app.use('/api/tickets', require('./routes/tickets-sqlite'));
app.use('/api/admin', require('./routes/admin-sqlite'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// SQLite (sql.js) database will be ready after a brief moment

const PORT = process.env.PORT || 5050;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: tickets.db`);
});
