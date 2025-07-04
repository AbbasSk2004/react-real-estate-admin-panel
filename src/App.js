import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import Properties from "./pages/Properties";
import Users from "./pages/Users";
import Inquiries from "./pages/Inquiries";
import Content from "./pages/Content";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/agents";
import Login from "./pages/Login";
import Profile from "./pages/profile";
import PrivateRoute from "./PrivateRoute";
import { NotificationProvider } from './context/NotificationContext';
import './styles/global.css';  // Import global styles
import './styles/settings.css';
import './styles/high-contrast-override.css';
import authService from './services/auth';

// Layout wrapper for protected routes
const ProtectedLayout = ({ children }) => {
  return (
    <div>
      <div className="container-fluid">
        {children}
      </div>
    </div>
  );
};

// Auto logout handler component
const AutoLogoutHandler = () => {
  useEffect(() => {
    const tokenExists = !!authService.getToken?.() || localStorage.getItem('admin_token');

    // If there's no token at all, no need to run the expiration checks on this page
    if (!tokenExists) {
      return;
    }

    // If token exists but is already expired, force logout immediately
    if (authService.isTokenExpired()) {
      authService.logout();
      return;
    }

    // Set up interval to check token expiration
    const checkInterval = setInterval(() => {
      if (authService.isTokenExpired()) {
        console.log('Token expired, logging out...');
        authService.logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, []);

  return null; // This component doesn't render anything
};

const App = () => {
  return (
    <Router>
      <NotificationProvider>
        <AutoLogoutHandler />
        <Routes>
          {/* Public route - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          <Route path="/properties" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Properties />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Users />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          <Route path="/inquiries" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Inquiries />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          <Route path="/content" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Content />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          <Route path="/analytics" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Analytics />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          <Route path="/agents" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Agents />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Profile />
              </ProtectedLayout>
            </PrivateRoute>
          } />

          {/* Redirect root to dashboard if authenticated, login if not */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Catch all unknown routes and redirect to root */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </NotificationProvider>
    </Router>
  );
};

export default App;
