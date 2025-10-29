const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Accès non autorisé' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-change-in-production');
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Accès non autorisé' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-change-in-production');
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès admin requis' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = { auth, adminAuth };




