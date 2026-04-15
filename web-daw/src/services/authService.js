/**
 * Authentication Service - Handles user authentication
 * Provides functions for login, register, and token management
 */

import { safeJSONParse, clearAuthStorage } from '../utils/storageCleanup';

const API_BASE_URL = 'http://localhost:8000';

class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
    try {
      this.token = localStorage.getItem('token') || null;
      const userStr = localStorage.getItem('user');
      this.user = safeJSONParse(userStr);
    } catch (error) {
      console.error('AuthService initialization error:', error);
      this.token = null;
      this.user = null;
      // Clear corrupted localStorage data
      clearAuthStorage();
    }
  }

  // Generic request method with auth
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...(options.headers || {})
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Auth request failed:', error);
      throw error;
    }
  }

  // Register new user
  async register(userData) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }

    return data;
  }

  // Login user
  async login(credentials) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }

    return data;
  }

  // Get current user
  async getCurrentUser() {
    if (!this.token) {
      throw new Error('No token found');
    }

    const data = await this.request('/api/auth/me');
    this.setUser(data.user);
    return data.user;
  }

  // Logout user
  logout() {
    this.removeToken();
    this.removeUser();
  }

  // Token management
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    return this.token;
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // User management
  setUser(user) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    return this.user;
  }

  removeUser() {
    this.user = null;
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Check if token is valid (basic check)
  isTokenValid() {
    if (!this.token) return false;
    
    try {
      // Simple JWT decode check (you might want to use a proper JWT library)
      const parts = this.token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      // Clear invalid token
      this.removeToken();
      return false;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
