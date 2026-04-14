/**
 * Main App Component - Entry point for the Web DAW
 * Integrates all components and manages the application lifecycle
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import page components
import LandingPage from './pages/LandingPage';
import ProjectsPage from './pages/ProjectsPage';
import DAWInterfacePage from './pages/DAWInterfacePage';

// Import core modules
function App() {
  // Create a wrapper component to handle project navigation
  const ProjectPageWrapper = () => {
    const handleEnterDAW = (project) => {
      // Navigate to DAW interface with project data
      // Store project data in localStorage or context for the DAW page to access
      localStorage.setItem('currentProject', JSON.stringify(project));
      window.location.href = '/daw-interface';
    };

    return <ProjectsPage onEnterDAW={handleEnterDAW} />;
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Landing Page - Marketing and overview */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Projects Page - Show user projects */}
          <Route path="/projects" element={<ProjectPageWrapper />} />
          
          {/* DAW Interface - Main audio production workspace */}
          <Route path="/daw-interface" element={<DAWInterfacePage />} />
          
          {/* Redirect any unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
