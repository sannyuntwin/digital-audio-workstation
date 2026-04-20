/**
 * Login Page - User authentication
 * Provides login form and handles user authentication
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by auth context
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="audio-waves">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">Web DAW</div>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue creating amazing music</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <div className="error-icon">!</div>
                <span>{error}</span>
              </div>
            )}

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
                placeholder="Enter your username"
                autoFocus
                className="form-input"
              />
            </div>

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
                placeholder="Enter your password"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading || isSubmitting || !formData.username || !formData.password}
            >
              {isSubmitting ? (
                <span className="button-content">
                  <div className="spinner"></div>
                  Signing in...
                </span>
              ) : (
                <span className="button-content">
                  Sign In
                  <span className="button-arrow">{'->'}</span>
                </span>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="link">
                Sign up for free
              </Link>
            </p>
            <div className="demo-info">
              <p>Demo users available:</p>
              <div className="demo-users">
                <span>admin / password123</span>
                <span>demo / password123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
