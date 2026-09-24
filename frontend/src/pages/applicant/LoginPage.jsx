import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, VALID_CREDENTIALS } from '../../context/AuthContext';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Toast from '../../components/shared/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const destination = isAdmin ? '/admin/dashboard' : '/applicant/status';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setToastMessage('');

    const res = login(email, password);

    if (res.success) {
      setToastType('success');
      setToastMessage('Authentication successful. Redirecting...');
      setTimeout(() => {
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/applicant/status', { replace: true });
        }
      }, 400);
    } else {
      setToastType('error');
      setToastMessage(res.message || 'Login failed. Please verify credentials.');
      setIsSubmitting(false);
    }
  };

  const autofillApplicant = () => {
    setEmail(VALID_CREDENTIALS.applicant.email);
    setPassword(VALID_CREDENTIALS.applicant.password);
    setToastType('info');
    setToastMessage('Filled dummy Applicant credentials.');
  };

  const autofillAdmin = () => {
    setEmail(VALID_CREDENTIALS.admin.email);
    setPassword(VALID_CREDENTIALS.admin.password);
    setToastType('info');
    setToastMessage('Filled dummy Admin credentials.');
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2.5rem auto 1rem' }}>
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />

      <Card>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            className="mota-emblem"
            style={{
              display: 'inline-block',
              fontSize: '1rem',
              padding: '0.4rem 0.8rem',
              marginBottom: '0.75rem'
            }}
          >
            MoTA • NFST
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Ministry of Tribal Affairs
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            National Fellowship for Higher Education of ST Students (NFST)
          </p>
          <div style={{ marginTop: '0.5rem' }}>
            <span className="scheme-tag">Scheme Code: ARG45</span>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Official Registered Email ID
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. applicant@nfst.gov.in"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
          >
            {isSubmitting ? 'Verifying Credentials...' : 'Sign In to Portal'}
          </Button>
        </form>

        {/* Demo Credentials Box */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1.25rem',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--color-border)'
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Fixed Demo Credentials (Click to quick-fill):
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Applicant credentials pill */}
            <div
              onClick={autofillApplicant}
              style={{
                cursor: 'pointer',
                padding: '0.75rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #D5E3F5',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                  👤 Applicant Login
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  [Click to Autofill]
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                Email: <code>applicant@nfst.gov.in</code>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                Password: <code>applicant123</code>
              </div>
            </div>

            {/* Admin credentials pill */}
            <div
              onClick={autofillAdmin}
              style={{
                cursor: 'pointer',
                padding: '0.75rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #D5E3F5',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-accent)' }}>
                  🛡️ Ministry Admin Login
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                  [Click to Autofill]
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                Email: <code>admin@mota.gov.in</code>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                Password: <code>admin123</code>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
