import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/loginform';
import authService from '../services/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
          const user = authService.getCurrentUser();
          if (user && user.role === 'admin') {
            // User is already logged in, no need to update status again
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear any invalid auth state
        await authService.logout(); // Using await since logout is now async
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate, location]);

  const handleLoginSuccess = () => {
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="bg-gradient-primary min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-primary min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={4}>
            <div className="text-center mb-4">
              <h1 className="h2 text-white mb-2">Welcome Back!</h1>
              <p className="text-white-50">Please login to access the admin panel</p>
            </div>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
            <div className="text-center mt-4">
              <p className="text-white-50 mb-0">
                © {new Date().getFullYear()} Admin Panel. All rights reserved.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
