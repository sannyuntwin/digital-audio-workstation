/**
 * SQLite Database Initialization Script
 * Creates tables for projects, tracks, clips, and users
 */

const knex = require('knex');
const path = require('path');

// Create SQLite database connection
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../data/webdaw.db')
  },
  useNullAsDefault: true
});

async function initializeDatabase() {
  try {
    console.log('Initializing SQLite database...');

    // Create users table
    await db.schema.createTableIfNotExists('users', (table) => {
      table.uuid('id').primary();
      table.string('username').unique().notNullable();
      table.string('email').unique().notNullable();
      table.string('password_hash').notNullable();
      table.string('first_name');
      table.string('last_name');
      table.string('avatar_url');
      table.datetime('created_at').defaultTo(db.fn.now());
      table.datetime('updated_at').defaultTo(db.fn.now());
    });

    // Create projects table
    await db.schema.createTableIfNotExists('projects', (table) => {
      table.uuid('id').primary();
      table.string('name').notNullable();
      table.text('description').defaultTo('');
      table.integer('bpm').defaultTo(120);
      table.json('time_signature').defaultTo(JSON.stringify({ numerator: 4, denominator: 4 }));
      table.integer('sample_rate').defaultTo(44100);
      table.json('settings').defaultTo(JSON.stringify({ zoomLevel: 1, masterVolume: 1 }));
      table.json('metadata').defaultTo(JSON.stringify({ version: '1.0.0' }));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.datetime('created_at').defaultTo(db.fn.now());
      table.datetime('updated_at').defaultTo(db.fn.now());
    });

    // Create tracks table
    await db.schema.createTableIfNotExists('tracks', (table) => {
      table.uuid('id').primary();
      table.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('type').notNullable().checkIn(['audio', 'midi']);
      table.real('volume').defaultTo(0.7).checkBetween([0, 1.5]);
      table.real('pan').defaultTo(0).checkBetween([-1, 1]);
      table.boolean('is_muted').defaultTo(false);
      table.boolean('is_solo').defaultTo(false);
      table.string('color').defaultTo('#4CAF50');
      table.datetime('created_at').defaultTo(db.fn.now());
      table.datetime('updated_at').defaultTo(db.fn.now());
    });

    // Create clips table
    await db.schema.createTableIfNotExists('clips', (table) => {
      table.uuid('id').primary();
      table.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE');
      table.uuid('track_id').references('id').inTable('tracks').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('type').notNullable().checkIn(['audio', 'midi']);
      table.real('start_time').defaultTo(0).checkPositive();
      table.real('duration').notNullable().checkPositive();
      table.string('file_name');
      table.string('file_path');
      table.integer('file_size');
      table.integer('sample_rate');
      table.integer('bit_depth');
      table.integer('channels');
      table.json('settings').defaultTo('{}');
      table.datetime('created_at').defaultTo(db.fn.now());
      table.datetime('updated_at').defaultTo(db.fn.now());
    });

    // Create indexes
    await db.schema.raw('CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC)');
    await db.schema.raw('CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC)');
    await db.schema.raw('CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)');
    await db.schema.raw('CREATE INDEX IF NOT EXISTS idx_tracks_project_id ON tracks(project_id)');
    await db.schema.raw('CREATE INDEX IF NOT EXISTS idx_clips_project_id ON clips(project_id)');
    await db.schema.raw('CREATE INDEX IF NOT EXISTS idx_clips_track_id ON clips(track_id)');

    console.log('SQLite database initialized successfully!');
    console.log('Created tables: users, projects, tracks, clips');

  } catch (error) {
    console.error('Error initializing SQLite database:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase().catch(console.error);
}

module.exports = { initializeDatabase };
