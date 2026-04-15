/**
 * HomePage Component - Project management dashboard
 * Landing page for Web DAW where users can create, load, and manage projects
 */

import React, { useState, useEffect, useCallback } from 'react';
import '../../index.css';
import apiService from '../../services/apiService';

const HomePage = ({ onEnterDAW }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

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
      
      // Auto-enter the new project
      handleEnterProject(newProject.data);
      
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  }, [newProjectName, loadProjects]);

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

  const handleEnterProject = useCallback((project) => {
    console.log('Entering project:', project);
    onEnterDAW(project);
  }, [onEnterDAW]);

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

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo">
            <h1>Web DAW</h1>
            <p>Digital Audio Workstation in your browser</p>
          </div>
          <div className="header-actions">
            <button 
              className="primary-btn"
              onClick={() => document.getElementById('create-project-input').focus()}
            >
              + New Project
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-main">
        {/* Create Project Section */}
        <section className="create-section">
          <div className="create-card">
            <h2>Create New Project</h2>
            <div className="create-form">
              <input
                id="create-project-input"
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
                {creatingProject ? 'Creating...' : 'Create Project'}
              </button>
            </div>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Projects Section */}
        <section className="projects-section">
          <div className="section-header">
            <h2>Your Projects</h2>
            <div className="project-count">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner">Loading projects...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">No projects yet</div>
              <h3>No projects yet</h3>
              <p>Create your first project to get started with music production</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => {
                const { trackCount, clipCount } = getProjectStats(project);
                return (
                  <div key={project.id} className="project-card">
                    <div className="project-info">
                      <h3>{project.name}</h3>
                      <p className="project-description">
                        {project.description || 'No description'}
                      </p>
                      <div className="project-meta">
                        <span className="project-date">
                          {formatDate(project.updatedAt)}
                        </span>
                        <div className="project-stats">
                          <span className="stat">
                            {trackCount} track{trackCount !== 1 ? 's' : ''}
                          </span>
                          <span className="stat">
                            {clipCount} clip{clipCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="project-actions">
                      <button 
                        onClick={() => handleEnterProject(project)}
                        className="enter-btn"
                      >
                        Open
                      </button>
                      <button 
                        onClick={() => deleteProject(project.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <div className="quick-actions-card">
            <h3>Quick Start</h3>
            <div className="quick-actions-grid">
              <button 
                onClick={() => {
                  setNewProjectName('Quick Demo');
                  createProject();
                }}
                className="quick-action-btn"
              >
                <span className="icon">Demo</span>
                <span>Quick Demo Project</span>
              </button>
              <button 
                onClick={() => {
                  setNewProjectName('Podcast Episode');
                  createProject();
                }}
                className="quick-action-btn"
              >
                <span className="icon">Podcast</span>
                <span>Podcast Episode</span>
              </button>
              <button 
                onClick={() => {
                  setNewProjectName('Music Production');
                  createProject();
                }}
                className="quick-action-btn"
              >
                <span className="icon">Music</span>
                <span>Music Production</span>
              </button>
              <button 
                onClick={() => {
                  setNewProjectName('Voice Recording');
                  createProject();
                }}
                className="quick-action-btn"
              >
                <span className="icon">Voice</span>
                <span>Voice Recording</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-content">
          <h2>Web DAW Features</h2>
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>Web DAW - Professional Digital Audio Workstation in your browser</p>
        <p>Built with React, Web Audio API, and Node.js</p>
      </footer>
    </div>
  );
};

export default HomePage;
