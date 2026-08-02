import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../stores/toastStore';
import { LogIn, AlertCircle } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Stored location path to return to (e.g. from ProtectedRoute or useAuthAction)
  const from = location.state?.from || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter your email address and password.');
      return;
    }

    try {
      await login(email, password);
      toast.success('Welcome back! Login successful.');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      const msg = error.response?.data?.message || 'Invalid email or password credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      padding: '24px',
      backgroundColor: 'var(--bg-color)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '420px',
        padding: '36px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--primary-color)', margin: '0 0 8px' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
            Log in to manage orders, cart, and profile
          </p>
        </div>

        {errorMessage && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--error)',
            marginBottom: '20px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px', textAlign: 'left' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', textAlign: 'left' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', padding: '14px', marginTop: '8px' }}
          >
            <LogIn size={18} /> {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have an account yet? </span>
          <Link to="/register" state={{ from }} style={{ color: 'var(--primary-color)', fontWeight: '700', textDecoration: 'none' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
