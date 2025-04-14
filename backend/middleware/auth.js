const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication middleware for routes
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization');
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Extract token from Bearer format
    const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    try {
      // Verify token
      const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
      
      // Add user id to request object
      req.user = { id: decoded.id };
      
      // Find user in database
      const user = await User.findById(decoded.id).select('-password');
      
      // Check if user exists
      if (!user) {
        return res.status(401).json({ message: 'User not found, token invalid' });
      }
      
      // Add user to request object
      req.user = user;
      
      next();
    } catch (err) {
      console.error('Token verification error:', err.message);
      res.status(401).json({ message: 'Token is invalid or expired' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied, admin required' });
  }
  next();
};

module.exports = auth;
module.exports.adminOnly = adminOnly;