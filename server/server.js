/**
 * Web DAW Server - Main entry point
 * Express server with WebSocket support for real-time features
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import database
const { db, testConnection } = require('./src/config/database');

// Import routes
const projectRoutes = require('./src/routes/projects');
const authRoutes = require('./src/routes/auth');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const { authenticateSocket } = require('./src/middleware/auth');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   contentSecurityPolicy: false
// }));

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Web DAW Server API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      projects: '/api/projects',
      audio: '/api/audio'
    }
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join project room for real-time collaboration
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`📁 Client ${socket.id} joined project ${projectId}`);
  });

  // Leave project room
  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`📤 Client ${socket.id} left project ${projectId}`);
  });

  // Real-time project updates
  socket.on('project-update', (data) => {
    socket.to(`project-${data.projectId}`).emit('project-updated', data);
  });

  // Real-time cursor position for collaboration
  socket.on('cursor-position', (data) => {
    socket.to(`project-${data.projectId}`).emit('cursor-moved', {
      userId: socket.id,
      position: data.position,
      timestamp: data.timestamp
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Web DAW Server running on port ${PORT}`);
      console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log(`📂 Uploads directory: ${path.join(__dirname, 'uploads')}`);
      console.log(`📁 Database: PostgreSQL connected`);
    });
  } catch (error) {
    console.error('🛑 Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, io };
