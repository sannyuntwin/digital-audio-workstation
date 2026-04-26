/**
 * Authentication Middleware
 * JWT token verification and socket authentication
 */

const jwt = require('jsonwebtoken');

// Secret key for JWT - in production use an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'web-daw-super-secret-key';

/**
 * Verify JWT token for HTTP requests
 */
const authenticate = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token')
    || req.header('Authorization')?.replace('Bearer ', '')
    || req.query?.token;
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Authenticate WebSocket connections
 */
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  const token = req.header('x-auth-token')
    || req.header('Authorization')?.replace('Bearer ', '')
    || req.query?.token;
  
  if (!token) {
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Just continue without user
    next();
  }
};

module.exports = {
  authenticate,
  authenticateSocket,
  optionalAuth
};
