import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApplications } from '../../services/api';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import ApplicantTable from '../../components/admin/ApplicantTable';
import WorkflowVisualizerModal from '../../components/shared/WorkflowVisualizerModal';

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchApplications();
      setApplications(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectApplicant = (id) => {
    navigate(`/admin/review/${id}`);
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === 'ALL') return true;
    return app.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const countTotal = applications.length;
  const countSubmitted = applications.filter((a) => a.status === 'Submitted').length;
  const countUnderReview = applications.filter((a) => a.status === 'Under Review').length;
  const countDeficiency = applications.filter((a) => a.status === 'Deficiency Raised').length;
  const countDuplicate = applications.filter((a) => a.status === 'Flagged - Possible Duplicate' || !!a.duplicateOf).length;
  const countSelected = applications.filter((a) => a.status === 'Selected').length;
  const countRejected = applications.filter((a) => a.status === 'Rejected').length;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="scheme-tag">MoTA Multi-Scheme Review Portal</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Live Schemes: NFST (ARG45) & NOS (AZKMI)
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Application Review Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
            Verification, Duplicate Detection & Deficiency Remediation Desk
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" onClick={() => setShowWorkflowModal(true)}>
            🗺️ Workflow Explorer
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/selection')}>
            ⚖️ Selection Desk
          </Button>
          <Button variant="outline" size="sm" onClick={loadData}>
            ↻ Refresh Records
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        <div
          onClick={() => setFilterStatus('ALL')}
          style={{
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            border: filterStatus === 'ALL' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Total Dossiers
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.2rem' }}>
            {countTotal}
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('Submitted')}
          style={{
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            border: filterStatus === 'Submitted' ? '2px solid #0D47A1' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            New Submitted
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0D47A1', marginTop: '0.2rem' }}>
            {countSubmitted}
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('Under Review')}
          style={{
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            border: filterStatus === 'Under Review' ? '2px solid var(--color-warning)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Under Review
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-accent)', marginTop: '0.2rem' }}>
            {countUnderReview}
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('Deficiency Raised')}
          style={{
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            border: filterStatus === 'Deficiency Raised' ? '2px solid #EA580C' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#C2410C', textTransform: 'uppercase', fontWeight: 700 }}>
            ⚠️ Deficiency Raised
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#C2410C', marginTop: '0.2rem' }}>
            {countDeficiency}
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('Flagged - Possible Duplicate')}
          style={{
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            border: filterStatus === 'Flagged - Possible Duplicate' ? '2px solid #D97706' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#B45309', textTransform: 'uppercase', fontWeight: 700 }}>
            ⚠️ Duplicate Flags
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#B45309', marginTop: '0.2rem' }}>
            {countDuplicate}
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('Selected')}
          style={{
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            border: filterStatus === 'Selected' ? '2px solid var(--color-success)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Awarded / Selected
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.2rem' }}>
            {countSelected}
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('Rejected')}
          style={{
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            border: filterStatus === 'Rejected' ? '2px solid var(--color-error)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Rejected
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-error)', marginTop: '0.2rem' }}>
            {countRejected}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title={`Applications List (${filteredApplications.length})`}
        subtitle="Click any row or 'Review Dossier' to inspect details and AI document OCR analysis"
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-primary)' }}>
            Loading NFST applicant submissions...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</p>
            <Button variant="primary" onClick={loadData}>Retry</Button>
          </div>
        ) : (
          <ApplicantTable
            applications={filteredApplications}
            onSelectApplicant={handleSelectApplicant}
          />
        )}
      </Card>

      {/* System Workflow Visualizer Explorer Modal */}
      {showWorkflowModal && (
        <WorkflowVisualizerModal
          onClose={() => setShowWorkflowModal(false)}
        />
      )}
    </div>
  );
}
