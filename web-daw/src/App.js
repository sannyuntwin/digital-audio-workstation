/**
 * Main App Component - Entry point for the Web DAW
 * Integrates all components and manages the application lifecycle
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Import auth context
import { AuthProvider } from './contexts/AuthContext';

// Import page components
import LandingPage from './pages/LandingPage';
import ProjectsPage from './pages/ProjectsPage';
import DAWInterfacePage from './pages/DAWInterfacePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Import protected route component
import ProtectedRoute from './components/ProtectedRoute';

// App content with routes
function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route path="/projects" element={
        <ProtectedRoute>
          <ProjectsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/daw/:projectId" element={
        <ProtectedRoute>
          <DAWInterfacePage />
        </ProtectedRoute>
      } />
      
      <Route path="/daw" element={
        <ProtectedRoute>
          <DAWInterfacePage />
        </ProtectedRoute>
      } />
      
      {/* Redirect any unknown routes to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App component with auth provider
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
