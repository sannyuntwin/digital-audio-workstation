/**
 * Projects Page Component
 * Shows all user projects with management options
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';

const ProjectsPage = ({ onEnterDAW }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getProjects();
      setProjects(response.data || []);
      console.log('Loaded projects:', response.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEnterProject = useCallback((project) => {
    console.log('Entering project:', project.name);
    // Navigate to DAW with project ID
    navigate(`/project/${project.id}`);
  }, [navigate]);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createProject = useCallback(async () => {
    if (!newProjectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    try {
      setCreatingProject(true);
      setError(null);
      
      const projectData = {
        name: newProjectName.trim(),
        bpm: 120,
        tracks: [],
        clips: [],
        settings: {
          zoomLevel: 1,
          currentTime: 0
        }
      };

      const newProject = await apiService.createProject(projectData);
      console.log('Created project:', newProject.data);
      
      // Reload projects list
      await loadProjects();
      
      // Clear form
      setNewProjectName('');
      
      // Navigate to DAW with the new project
      navigate(`/project/${newProject.data.id}`);
      
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  }, [newProjectName, loadProjects, navigate]);

  const deleteProject = useCallback(async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await apiService.deleteProject(projectId);
      console.log('Deleted project:', projectId);
      
      // Reload projects list
      await loadProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError('Failed to delete project');
    }
  }, [loadProjects]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProjectStats = (project) => {
    const trackCount = project.tracks?.length || 0;
    const clipCount = project.clips?.length || 0;
    return { trackCount, clipCount };
  };

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <div className="projects-page">
      {/* Navigation Header */}
      <nav className="projects-nav">
        <div className="nav-content">
          <div className="nav-brand">
            <Link to="/" className="brand-link">
              <span className="brand-icon">Web DAW</span>
            </Link>
          </div>
          <div className="nav-actions">
            <span className="welcome-text">Welcome, {user?.first_name || user?.username}</span>
            <button onClick={handleLogout} className="nav-btn secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="projects-main">
        {/* Hero Section */}
        <section className="projects-hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">My Dashboard</h1>
              <p className="hero-subtitle">Create, manage, and collaborate on your music productions</p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">{projects.length}</span>
                  <span className="stat-label">Projects</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{projects.reduce((total, p) => total + (p.tracks?.length || 0), 0)}</span>
                  <span className="stat-label">Tracks</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{projects.reduce((total, p) => total + (p.clips?.length || 0), 0)}</span>
                  <span className="stat-label">Clips</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Create Project Section */}
        <section className="create-section">
          <div className="create-card">
            <div className="create-header">
              <h2>Create New Project</h2>
              <p>Start your next musical masterpiece</p>
            </div>
            <div className="create-form">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createProject()}
                  className="project-name-input"
                />
                <button 
                  onClick={createProject}
                  disabled={creatingProject || !newProjectName.trim()}
                  className="create-btn"
                >
                  {creatingProject ? (
                    <span className="button-content">
                      <div className="spinner"></div>
                      Creating...
                    </span>
                  ) : (
                    <span className="button-content">
                      Create Project
                      <span className="button-arrow">{'->'}</span>
                    </span>
                  )}
                </button>
              </div>
              {error && (
                <div className="error-message">
                  <div className="error-icon">!</div>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="projects-section">
          <div className="section-header">
            <h2 className="section-title">Your Projects</h2>
            <div className="project-count">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading projects...</p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-projects">
              <div className="empty-icon">No projects yet</div>
              <h2>No projects yet</h2>
              <p>Create your first project to get started with music production</p>
              <button 
                onClick={() => {
                  setNewProjectName('My First Project');
                  createProject();
                }}
                className="create-first-btn"
              >
                <span className="button-content">
                  Create Your First Project
                  <span className="button-arrow">{'->'}</span>
                </span>
              </button>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => {
                const { trackCount, clipCount } = getProjectStats(project);
                return (
                  <div key={project.id} className="project-card">
                    <div className="project-preview">
                      <div className="preview-tracks">
                        {[...Array(Math.min(4, trackCount || 1))].map((_, i) => (
                          <div key={i} className="preview-track"></div>
                        ))}
                      </div>
                      <div className="preview-clips">
                        {[...Array(Math.min(3, clipCount || 1))].map((_, i) => (
                          <div key={i} className="preview-clip"></div>
                        ))}
                      </div>
                    </div>
                    <div className="project-info">
                      <h3>{project.name}</h3>
                      <p className="project-description">
                        {project.description || 'Click to open and start creating'}
                      </p>
                      <div className="project-meta">
                        <div className="project-stats">
                          <span className="stat">
                            <span className="stat-icon">Tracks</span>
                            {trackCount}
                          </span>
                          <span className="stat">
                            <span className="stat-icon">Clips</span>
                            {clipCount}
                          </span>
                          <span className="stat">
                            <span className="stat-icon">BPM</span>
                            {project.bpm || 120}
                          </span>
                        </div>
                        <span className="project-date">
                          {formatDate(project.updated_at)}
                        </span>
                      </div>
                    </div>
                    <div className="project-actions">
                      <button 
                        onClick={() => handleEnterProject(project)}
                        className="project-btn primary"
                      >
                        <span className="btn-icon">Open</span>
                        Open Project
                      </button>
                      <button 
                        onClick={() => deleteProject(project.id)}
                        className="project-btn delete"
                      >
                        <span className="btn-icon">Delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Test - Open First Project */}
        {projects.length > 0 && (
          <section className="quick-test-section">
            <button 
              onClick={() => handleEnterProject(projects[0])}
              className="quick-test-btn"
            >
              🎛️ Quick Test: Open "{projects[0].name}" in DAW
            </button>
          </section>
        )}

        {/* Quick Actions */}
        <section className="quick-actions">
          <div className="quick-actions-card">
            <h3>Quick Start Templates</h3>
            <p>Get started quickly with these pre-configured project templates</p>
            <div className="quick-actions-grid">
              <button 
                onClick={() => {
                  setNewProjectName('Quick Demo');
                  createProject();
                }}
                className="quick-action-btn"
              >
                <span className="quick-icon">Demo</span>
                <div className="quick-content">
                  <span className="quick-title">Quick Demo</span>
                  <span className="quick-desc">Test the DAW features</span>
                </div>
              </button>
              <button 
                onClick={() => {
                  setNewProjectName('Podcast Episode');
                  createProject();
                }}
                className="quick-action-btn"
              >
                <span className="quick-icon">Podcast</span>
                <div className="quick-content">
                  <span className="quick-title">Podcast Episode</span>
                  <span className="quick-desc">Perfect for voice recordings</span>
                </div>
              </button>
              <button 
                onClick={() => {
                  setNewProjectName('Music Production');
                  createProject();
                }}
                className="quick-action-btn"
              >
                <span className="quick-icon">Music</span>
                <div className="quick-content">
                  <span className="quick-title">Music Production</span>
                  <span className="quick-desc">Multi-track music project</span>
                </div>
              </button>
              <button 
                onClick={() => {
                  setNewProjectName('Voice Recording');
                  createProject();
                }}
                className="quick-action-btn"
              >
                <span className="quick-icon">Voice</span>
                <div className="quick-content">
                  <span className="quick-title">Voice Recording</span>
                  <span className="quick-desc">Simple voice setup</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectsPage;
