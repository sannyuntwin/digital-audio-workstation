/**
 * Landing Page Component
 * Marketing page for Web DAW - showcases features and call-to-action
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <nav className="landing-nav">
        <div className="nav-content">
          <div className="nav-brand">
            <h1>Web DAW</h1>
          </div>
          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <span className="welcome-text">Welcome, {user?.first_name || user?.username}</span>
                <Link to="/projects" className="nav-btn primary">
                  My Projects
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn secondary">
                  Sign In
                </Link>
                <Link to="/register" className="nav-btn primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span>Professional Audio Production</span>
            </div>
            <h1 className="hero-title">Web DAW</h1>
            <p className="hero-subtitle">Professional Digital Audio Workstation in your browser</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Audio Effects</span>
              </div>
              <div className="stat">
                <span className="stat-number">Unlimited</span>
                <span className="stat-label">Projects</span>
              </div>
            </div>
            <div className="hero-cta">
              {isAuthenticated ? (
                <Link to="/projects" className="cta-primary">
                  Go to My Projects
                </Link>
              ) : (
                <>
                  <Link to="/register" className="cta-primary">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="cta-secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="daw-interface-preview">
            <div className="preview-header">
              <div className="preview-controls">
                <div className="preview-btn play"></div>
                <div className="preview-btn stop"></div>
                <div className="preview-btn record"></div>
              </div>
              <div className="preview-time">00:00:00</div>
            </div>
            <div className="preview-timeline">
              <div className="preview-track"></div>
              <div className="preview-track"></div>
              <div className="preview-track"></div>
              <div className="preview-track"></div>
            </div>
            <div className="preview-clips">
              <div className="preview-clip"></div>
              <div className="preview-clip"></div>
              <div className="preview-clip"></div>
              <div className="preview-clip"></div>
              <div className="preview-clip"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Professional Features</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">Audio</div>
              <h3>Audio Editing</h3>
              <p>Upload, edit, and arrange audio files with professional tools</p>
            </div>
            <div className="feature">
              <div className="feature-icon">Tracks</div>
              <h3>Multi-Track</h3>
              <p>Work with unlimited audio and MIDI tracks</p>
            </div>
            <div className="feature">
              <div className="feature-icon">Effects</div>
              <h3>Effects & Processing</h3>
              <p>Apply professional audio effects and processing</p>
            </div>
            <div className="feature">
              <div className="feature-icon">Cloud</div>
              <h3>Cloud Storage</h3>
              <p>Your projects are automatically saved to the cloud</p>
            </div>
            <div className="feature">
              <div className="feature-icon">Real-time</div>
              <h3>Real-time Collaboration</h3>
              <p>Work together with other musicians in real-time</p>
            </div>
            <div className="feature">
              <div className="feature-icon">Export</div>
              <h3>Export Options</h3>
              <p>Export your projects to various audio formats</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="workflow">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="workflow-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Create Project</h3>
                <p>Start a new project or choose from templates</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Add Tracks</h3>
                <p>Add audio and MIDI tracks to your project</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Upload Audio</h3>
                <p>Drag and drop audio files or record directly</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Edit & Mix</h3>
                <p>Arrange clips, add effects, and mix your project</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3>Export</h3>
                <p>Export your finished project to audio files</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-stack">
        <div className="container">
          <h2 className="section-title">Built with Modern Technology</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <div className="tech-icon">React</div>
              <h3>React 18</h3>
              <p>Modern UI framework for responsive interfaces</p>
            </div>
            <div className="tech-item">
              <div className="tech-icon">Node.js</div>
              <h3>Node.js</h3>
              <p>Backend server with WebSocket support</p>
            </div>
            <div className="tech-item">
              <div className="tech-icon">PostgreSQL</div>
              <h3>PostgreSQL</h3>
              <p>Robust database for project storage</p>
            </div>
            <div className="tech-item">
              <div className="tech-icon">Web Audio</div>
              <h3>Web Audio API</h3>
              <p>Browser-based audio processing</p>
            </div>
            <div className="tech-item">
              <div className="tech-icon">Docker</div>
              <h3>Docker</h3>
              <p>Containerized deployment</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2 className="section-title">Ready to Create?</h2>
          <p>Join thousands of musicians using Web DAW for professional audio production</p>
          <div className="cta-buttons">
            <Link to="/projects" className="cta-primary">
              View Projects
            </Link>
            <Link to="/daw-interface" className="cta-secondary">
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Web DAW</h3>
              <p>Professional Digital Audio Workstation</p>
            </div>
            <div className="footer-links">
              <Link to="/about">About</Link>
              <Link to="/features">Features</Link>
              <Link to="/docs">Documentation</Link>
              <Link to="/support">Support</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Web DAW. Built with React, Node.js, and PostgreSQL.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
