/**
 * Database Configuration
 * PostgreSQL connection setup using Knex.js
 */

const knex = require('knex');

// Database configuration
const dbConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'webdaw',
    user: process.env.DB_USER || 'webdaw',
    password: process.env.DB_PASSWORD || 'webdaw123',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
    propagateCreateError: false
  },
  migrations: {
    directory: './src/migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './src/seeds'
  }
};

// Create Knex instance
const db = knex(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log(' Database connection successful');
    return true;
  } catch (error) {
    console.error(' Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
const closeConnection = async () => {
  try {
    await db.destroy();
    console.log(' Database connection closed');
  } catch (error) {
    console.error(' Error closing database connection:', error);
  }
};

// Handle process termination
process.on('SIGINT', closeConnection);
process.on('SIGTERM', closeConnection);

module.exports = {
  db,
  testConnection,
  closeConnection
};
