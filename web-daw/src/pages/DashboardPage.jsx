import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

// ============ STYLES ============
const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: '12px',
  background: 'radial-gradient(circle at 15% 0%, #2a3f5f 0%, #131722 48%, #0d1118 100%)',
  color: '#f5f7fa',
  fontFamily: '"Avenir Next", "SF Pro Display", "Segoe UI", sans-serif'
};

const workspaceFrameStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.26)',
  background: 'rgba(8, 12, 18, 0.82)',
  boxShadow: '0 28px 52px rgba(0, 0, 0, 0.46)',
  backdropFilter: 'blur(6px)',
  overflow: 'hidden'
};

const dashboardContainerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  background: 'linear-gradient(180deg, rgba(11, 17, 29, 0.72) 0%, rgba(8, 12, 20, 0.9) 100%)',
  overflow: 'hidden'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#dbeafe',
  letterSpacing: '0.5px',
  textTransform: 'uppercase'
};

const userSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const userAvatarStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 700
};

const userNameStyle = {
  fontSize: '14px',
  color: '#eff6ff',
  fontWeight: 600
};

const contentStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const actionsSectionStyle = {
  display: 'flex',
  gap: '16px',
  marginBottom: '24px'
};

const actionCardStyle = {
  flex: 1,
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '12px',
  padding: '20px',
  background: 'rgba(15, 23, 42, 0.6)',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const actionCardHoverStyle = {
  ...actionCardStyle,
  borderColor: 'rgba(96, 165, 250, 0.4)',
  background: 'rgba(30, 64, 175, 0.3)',
  transform: 'translateY(-2px)'
};

const actionIconStyle = {
  fontSize: '48px',
  marginBottom: '12px'
};

const actionTitleStyle = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#eff6ff',
  marginBottom: '8px'
};

const actionDescriptionStyle = {
  fontSize: '12px',
  color: '#94a3b8'
};

const projectsSectionStyle = {
  flex: 1
};

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px'
};

const sectionTitleStyle = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#dbeafe',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const createProjectBtnStyle = {
  border: '1px solid rgba(34, 197, 94, 0.5)',
  borderRadius: '8px',
  padding: '8px 16px',
  background: 'rgba(34, 197, 94, 0.2)',
  color: '#86efac',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const projectsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '16px'
};

const projectCardStyle = {
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '12px',
  padding: '20px',
  background: 'rgba(15, 23, 42, 0.6)',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const projectCardHoverStyle = {
  ...projectCardStyle,
  borderColor: 'rgba(96, 165, 250, 0.4)',
  background: 'rgba(30, 64, 175, 0.3)',
  transform: 'translateY(-2px)'
};

const projectHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '12px'
};

const projectNameStyle = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#eff6ff',
  flex: 1
};

const projectMenuStyle = {
  border: 'none',
  background: 'transparent',
  color: '#94a3b8',
  fontSize: '16px',
  cursor: 'pointer',
  padding: '4px'
};

const projectMetaStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginBottom: '16px'
};

const metaItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  color: '#94a3b8'
};

const metaLabelStyle = {
  fontWeight: 600,
  color: '#cbd5e1'
};

const projectPreviewStyle = {
  height: '120px',
  background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(30, 64, 175, 0.2) 100%)',
  borderRadius: '8px',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#93c5fd',
  fontSize: '14px',
  border: '1px solid rgba(148, 163, 184, 0.1)'
};

const projectActionsStyle = {
  display: 'flex',
  gap: '8px'
};

const projectBtnStyle = {
  flex: 1,
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: '6px',
  padding: '6px 12px',
  background: 'rgba(15, 23, 42, 0.4)',
  color: '#bfdbfe',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'all 0.2s ease'
};

const openBtnStyle = {
  ...projectBtnStyle,
  borderColor: 'rgba(34, 197, 94, 0.5)',
  background: 'rgba(34, 197, 94, 0.2)',
  color: '#86efac'
};

const deleteBtnStyle = {
  ...projectBtnStyle,
  borderColor: 'rgba(239, 68, 68, 0.5)',
  background: 'rgba(239, 68, 68, 0.2)',
  color: '#fca5a5'
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '300px',
  color: '#94a3b8'
};

const emptyStateIconStyle = {
  fontSize: '64px',
  marginBottom: '16px',
  opacity: '0.5'
};

const emptyStateTextStyle = {
  fontSize: '18px',
  textAlign: 'center',
  marginBottom: '8px'
};

const emptyStateSubtextStyle = {
  fontSize: '14px',
  textAlign: 'center'
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProjects();
      setProjects(response.data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const projectData = {
        name: `New Project ${projects.length + 1}`,
        description: '',
        bpm: 120,
        timeSignature: { numerator: 4, denominator: 4 },
        sampleRate: 44100,
        tracks: [],
        clips: [],
        settings: { zoomLevel: 1, masterVolume: 1 }
      };

      const response = await apiService.createProject(projectData);
      const newProject = response.data || response;
      
      // Navigate to the newly created project
      navigate(`/project/${newProject.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project');
    }
  };

  const handleOpenProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await apiService.deleteProject(projectId);
        // Reload projects list
        await loadProjects();
      } catch (err) {
        console.error('Failed to delete project:', err);
        setError('Failed to delete project');
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    
    try {
      const dateObj = new Date(date);
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={workspaceFrameStyle}>
          <div style={dashboardContainerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
              <div style={{ color: '#94a3b8', fontSize: '18px' }}>Loading projects...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={workspaceFrameStyle}>
        <div style={dashboardContainerStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>Dashboard</h1>
            <div style={userSectionStyle}>
              <div style={userAvatarStyle}>
                {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <div style={userNameStyle}>
                {user?.first_name || user?.username || 'User'}
              </div>
            </div>
          </div>

          <div style={contentStyle}>
            <div style={actionsSectionStyle}>
              <div
                style={hoveredAction === 'new' ? actionCardHoverStyle : actionCardStyle}
                onMouseEnter={() => setHoveredAction('new')}
                onMouseLeave={() => setHoveredAction(null)}
                onClick={handleCreateProject}
              >
                <div style={actionIconStyle}>🎵</div>
                <div style={actionTitleStyle}>New Project</div>
                <div style={actionDescriptionStyle}>Start creating from scratch</div>
              </div>
              
              <div
                style={hoveredAction === 'template' ? actionCardHoverStyle : actionCardStyle}
                onMouseEnter={() => setHoveredAction('template')}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div style={actionIconStyle}>📋</div>
                <div style={actionTitleStyle}>From Template</div>
                <div style={actionDescriptionStyle}>Use project templates</div>
              </div>
              
              <div
                style={hoveredAction === 'import' ? actionCardHoverStyle : actionCardStyle}
                onMouseEnter={() => setHoveredAction('import')}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div style={actionIconStyle}>📁</div>
                <div style={actionTitleStyle}>Import Project</div>
                <div style={actionDescriptionStyle}>Import existing project</div>
              </div>
            </div>

            <div style={projectsSectionStyle}>
              <div style={sectionHeaderStyle}>
                <h2 style={sectionTitleStyle}>Recent Projects</h2>
                <button
                  type="button"
                  style={createProjectBtnStyle}
                  onClick={handleCreateProject}
                >
                  + New Project
                </button>
              </div>

              {error && (
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  color: '#fca5a5'
                }}>
                  {error}
                </div>
              )}
              
              {projects.length === 0 ? (
                <div style={emptyStateStyle}>
                  <div style={emptyStateIconStyle}>🎵</div>
                  <div style={emptyStateTextStyle}>No projects yet</div>
                  <div style={emptyStateSubtextStyle}>Create your first project to get started</div>
                </div>
              ) : (
                <div style={projectsGridStyle}>
                  {projects.map(project => (
                    <div
                      key={project.id}
                      style={hoveredProject === project.id ? projectCardHoverStyle : projectCardStyle}
                      onMouseEnter={() => setHoveredProject(project.id)}
                      onMouseLeave={() => setHoveredProject(null)}
                      onClick={() => handleOpenProject(project.id)}
                    >
                      <div style={projectHeaderStyle}>
                        <div style={projectNameStyle}>{project.name}</div>
                        <button
                          type="button"
                          style={projectMenuStyle}
                          onClick={(e) => handleDeleteProject(project.id, e)}
                        >
                          ⋯
                        </button>
                      </div>

                      <div style={projectMetaStyle}>
                        <div style={metaItemStyle}>
                          <span style={metaLabelStyle}>BPM:</span>
                          <span>{project.bpm}</span>
                        </div>
                        <div style={metaItemStyle}>
                          <span style={metaLabelStyle}>Tracks:</span>
                          <span>{project.tracks?.length || 0}</span>
                        </div>
                        <div style={metaItemStyle}>
                          <span style={metaLabelStyle}>Clips:</span>
                          <span>{project.clips?.length || 0}</span>
                        </div>
                        <div style={metaItemStyle}>
                          <span style={metaLabelStyle}>Modified:</span>
                          <span>{formatDate(project.updated_at)}</span>
                        </div>
                      </div>

                      <div style={projectPreviewStyle}>
                        Project Timeline Preview
                      </div>

                      <div style={projectActionsStyle}>
                        <button
                          type="button"
                          style={openBtnStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProject(project.id);
                          }}
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          style={projectBtnStyle}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          style={deleteBtnStyle}
                          onClick={(e) => handleDeleteProject(project.id, e)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
