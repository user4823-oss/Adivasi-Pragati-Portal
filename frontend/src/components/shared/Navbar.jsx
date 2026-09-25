import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import WorkflowVisualizerModal from './WorkflowVisualizerModal';

export default function Navbar() {
  const { user, isAuthenticated, isApplicant, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/applicant/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="navbar-brand">
              <div className="mota-emblem">MoTA</div>
              <div className="navbar-title">
                <h1>Adivasi Pragati Portal</h1>
                <span>Ministry of Tribal Affairs • Government of India</span>
              </div>
            </div>
          </Link>

          <div className="navbar-actions">
            {/* Interactive Workflow Guide trigger */}
            <button
              onClick={() => setShowWorkflowModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#EFF6FF',
                color: 'var(--color-primary)',
                border: '1px solid #BFDBFE',
                borderRadius: '6px',
                padding: '0.4rem 0.75rem',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Inspect System Lifecycle & Verification Workflow"
            >
              <span>🗺️</span>
              <span>Workflow Guide</span>
            </button>

            {isAuthenticated && (
              <nav className="nav-links">
                {isApplicant && (
                  <>
                    <Link
                      to="/applicant/apply"
                      className={`nav-link ${isActive('/applicant/apply') ? 'active' : ''}`}
                    >
                      Application Form
                    </Link>
                    <Link
                      to="/applicant/status"
                      className={`nav-link ${isActive('/applicant/status') ? 'active' : ''}`}
                    >
                      My Status
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
                    >
                      Dossier Review
                    </Link>
                    <Link
                      to="/admin/selection"
                      className={`nav-link ${isActive('/admin/selection') ? 'active' : ''}`}
                    >
                      Selection Desk
                    </Link>
                    <Link
                      to="/admin/schemes"
                      className={`nav-link ${isActive('/admin/schemes') ? 'active' : ''}`}
                    >
                      Scheme Rules
                    </Link>
                  </>
                )}
              </nav>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {isAuthenticated ? (
                <>
                  <div className="user-badge-container">
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-success)',
                        display: 'inline-block'
                      }}
                    />
                    <span className="user-email-text">{user.name || user.email}</span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.4rem',
                        backgroundColor: isAdmin ? '#E3F2FD' : '#E8F5E9',
                        color: isAdmin ? '#0D47A1' : '#2E7D32',
                        borderRadius: '4px'
                      }}
                    >
                      {isAdmin ? 'MoTA Admin' : 'Applicant'}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    title="Logout from session"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/applicant/login" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Workflow Visualizer Modal */}
      {showWorkflowModal && (
        <WorkflowVisualizerModal onClose={() => setShowWorkflowModal(false)} />
      )}
    </>
  );
}
