/**
 * Authentication Middleware
 * JWT token verification and socket authentication
 */

// Note: JWT functionality is optional for MVP
// Uncomment when you add authentication
// const jwt = require('jsonwebtoken');

/**
 * Verify JWT token for HTTP requests
 * For MVP, this is a placeholder - authentication is optional
 */
const authenticate = (req, res, next) => {
  // Placeholder authentication for MVP
  // In production, implement proper JWT verification
  req.user = { id: 'demo-user', name: 'Demo User' };
  next();
};

/**
 * Authenticate WebSocket connections
 */
const authenticateSocket = (socket, next) => {
  // Placeholder authentication for WebSocket
  socket.user = { id: 'demo-user', name: 'Demo User' };
  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  // Optional authentication for MVP
  req.user = { id: 'demo-user', name: 'Demo User' };
  next();
};

module.exports = {
  authenticate,
  authenticateSocket,
  optionalAuth
};
