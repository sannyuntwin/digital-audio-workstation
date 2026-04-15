const { db } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * User Model
 */
class AuthModel {
  /**
   * Find a user by ID
   */
  static async findById(id) {
    return db('users')
      .where({ id })
      .first();
  }

  /**
   * Find a user by username
   */
  static async findByUsername(username) {
    return db('users')
      .where({ username })
      .first();
  }

  /**
   * Find a user by email
   */
  static async findByEmail(email) {
    return db('users')
      .where({ email })
      .first();
  }

  /**
   * Create a new user
   */
  static async create(userData) {
    const { password, ...rest } = userData;
    const password_hash = await bcrypt.hash(password, 10);
    
    const [user] = await db('users')
      .insert({
        ...rest,
        password_hash
      })
      .returning(['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'created_at']);
      
    return user;
  }

  /**
   * Verify password
   */
  static async verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }
}

module.exports = AuthModel;
