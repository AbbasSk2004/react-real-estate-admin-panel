import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import authService from '../../services/auth';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      const user = response.user;
      
      if (user.role !== 'admin') {
        setError('Access denied. Only administrators can login.');
        authService.logout();
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      const data = err.response?.data;
      let message = 'Failed to login. Please check your credentials.';

      if (data?.error === 'PASSWORD_NOT_SET') {
        message = 'Your account has no password yet. Run the migration password repair script or reset your password.';
      } else if (data?.message) {
        message = data.message;
      } else if (data?.error === 'INVALID_CREDENTIALS') {
        message = 'Invalid email or password. If you migrated from Supabase, import your old passwords or use the default migrated password.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-lg border-0 rounded-lg">
      <div className="card-body p-5">
        <div className="text-center mb-5">
          <h1 className="h4 text-gray-900">Admin Login</h1>
          <p className="text-muted">Enter your credentials to access the admin panel</p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <FaEnvelope className="text-primary" />
              </span>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                disabled={loading}
                className="border-0 border-start"
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <FaLock className="text-primary" />
              </span>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={loading}
                className="border-0 border-start"
              />
            </div>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 py-2 fw-bold text-uppercase"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;
