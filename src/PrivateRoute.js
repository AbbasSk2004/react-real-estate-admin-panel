import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import authService from "./services/auth";
import api from "./services/api";

const PrivateRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const isAuth = authService.isAuthenticated();
        
        // Set authentication status right away
        if (mounted) {
          setIsAuthenticated(isAuth);
        }

        if (isAuth) {
          // Ping the server once to update status
          try {
            await api.get('/auth/status');
          } catch (error) {
            console.error('Error pinging server:', error);
            // If we got a 401/403, logout
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              await authService.logout();
              if (mounted) {
                setIsAuthenticated(false);
              }
            }
          }
          
          // Set up interval for pinging (every 5 minutes)
          const intervalId = setInterval(async () => {
            try {
              await api.get('/auth/status');
            } catch (error) {
              console.error('Error on interval ping:', error);
              if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                await authService.logout();
                if (mounted) {
                  setIsAuthenticated(false);
                }
              }
            }
          }, 5 * 60 * 1000);
          
          // Clean up interval on unmount
          if (mounted) {
            // Always set loading to false after authentication check
            setIsLoading(false);
            return () => {
              clearInterval(intervalId);
            };
          }
        } else {
          // Not authenticated, make sure to update loading state
          if (mounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        // Clear any invalid auth state
        await authService.logout();
      }
    };

    checkAuth();

    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;