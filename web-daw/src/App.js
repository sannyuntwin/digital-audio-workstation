/**
 * Main App Component - Entry point for the Web DAW
 * Integrates all components and manages the application lifecycle
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import './index.css';

// Import storage cleanup
import { initializeStorage } from './utils/storageCleanup';

// Import auth context
import { AuthProvider } from './contexts/AuthContext';

// Import page components
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DAWEditorPage from './pages/DAWEditorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Import protected route component
import ProtectedRoute from './components/ProtectedRoute';

function LegacyProjectRedirect() {
  const { projectId } = useParams();
  return <Navigate to={`/project/${projectId}/`} replace />;
}

// App content with routes
function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/daw-interface" element={<Navigate to="/dashboard" replace />} />
      <Route path="/about" element={<Navigate to="/" replace />} />
      <Route path="/features" element={<Navigate to="/" replace />} />
      <Route path="/docs" element={<Navigate to="/" replace />} />
      <Route path="/support" element={<Navigate to="/" replace />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/project/:projectId/*" element={
        <ProtectedRoute>
          <DAWEditorPage />
        </ProtectedRoute>
      } />

      <Route path="/daw/:projectId/*" element={
        <ProtectedRoute>
          <LegacyProjectRedirect />
        </ProtectedRoute>
      } />
      
      {/* Redirect any unknown routes to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App component with auth provider
function App() {
  // Initialize storage cleanup on app startup
  useEffect(() => {
    initializeStorage();
  }, []);

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
