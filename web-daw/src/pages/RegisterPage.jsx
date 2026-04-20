/**
 * Register Page - User registration
 * Provides registration form and handles user account creation
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      return 'Please fill in all required fields';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    if (!formData.email.includes('@')) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by auth context
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-background">
        <div className="audio-waves">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>
      </div>
      
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="logo">
              <div className="logo-icon">Web DAW</div>
            </div>
            <h2>Create Account</h2>
            <p>Join thousands of musicians creating amazing music</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <div className="error-icon">!</div>
                <span>{error}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">
                  <span className="label-icon">User</span>
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="Choose a username"
                  autoFocus
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon">Mail</span>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="Enter your email"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  <span className="label-icon">Lock</span>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="Create a password"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <span className="label-icon">Lock</span>
                  Confirm
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="Confirm your password"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">
                  <span className="label-icon">User</span>
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Your first name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">
                  <span className="label-icon">User</span>
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Your last name"
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={isLoading || isSubmitting || !formData.username || !formData.email || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
            >
              {isSubmitting ? (
                <span className="button-content">
                  <div className="spinner"></div>
                  Creating account...
                </span>
              ) : (
                <span className="button-content">
                  Create Account
                  <span className="button-arrow">{'->'}</span>
                </span>
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="link">
                Sign in
              </Link>
            </p>
            <div className="benefits">
              <div className="benefit">
                <span className="benefit-icon">Music</span>
                <span>Unlimited projects</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">Cloud</span>
                <span>Auto-save</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">Team</span>
                <span>Collaborate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
