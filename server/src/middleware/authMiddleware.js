const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header
 * Extracts userId and adds it to req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header (Bearer <token>)
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided. Please login.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');
    
    // Attach user info to request object
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    res.status(401).json({ message: 'Authentication failed.' });
  }
};

module.exports = authMiddleware;
