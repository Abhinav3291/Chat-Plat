import React, { useState } from 'react';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Layout from './components/layout/Layout';
import './index.css';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onToggle={() => setShowLogin(false)} />
    ) : (
      <Register onToggle={() => setShowLogin(true)} />
    );
  }

  return (
    <SocketProvider>
      <Layout />
    </SocketProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CssBaseline />
        <div className="app">
          <AppContent />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
