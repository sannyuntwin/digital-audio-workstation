/**
 * SQLite Database Configuration for Testing
 * Alternative to PostgreSQL when PostgreSQL is not available
 */

const knex = require('knex');
const path = require('path');

// SQLite database configuration
const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../../data/webdaw.db')
  },
  useNullAsDefault: true,
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
    console.log(' SQLite database connection successful');
    return true;
  } catch (error) {
    console.error(' SQLite database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
const closeConnection = async () => {
  try {
    await db.destroy();
    console.log(' SQLite database connection closed');
  } catch (error) {
    console.error(' Error closing SQLite database connection:', error);
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
