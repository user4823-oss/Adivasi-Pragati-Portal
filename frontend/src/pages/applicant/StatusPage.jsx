import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchLatestApplication, resubmitApplication } from '../../services/api';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import Toast from '../../components/shared/Toast';

export default function StatusPage() {
  const { user } = useAuth();
  const location = useLocation();

  const [application, setApplication] = useState(location.state?.application || null);
  const [loading, setLoading] = useState(!location.state?.application);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Resubmission state
  const [resubmitFileName, setResubmitFileName] = useState('');
  const [resubmissionNote, setResubmissionNote] = useState('');
  const [isResubmitting, setIsResubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const app = await fetchLatestApplication(user?.email || 'applicant@nfst.gov.in');
      setApplication(app);
      if (app && app.status === 'Deficiency Raised') {
        const flaggedKey = app.flaggedDocument || Object.keys(app.documents || {})[0] || 'casteCertificate';
        setResubmitFileName(`${flaggedKey}_corrected_v2.pdf`);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve your scholarship application status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!resubmitFileName) {
      alert('Please select or specify a corrected document file.');
      return;
    }

    setIsResubmitting(true);
    setToastMessage('');

    try {
      const flaggedKey = application.flaggedDocument || Object.keys(application.documents || {})[0] || 'casteCertificate';
      const updatedDocs = {
        [flaggedKey]: resubmitFileName
      };

      const updated = await resubmitApplication(application.id, updatedDocs, resubmissionNote);
      setApplication(updated);
      setToastType('success');
      setToastMessage('Corrected document resubmitted successfully! Your dossier has returned to the Under Review queue.');
      setResubmissionNote('');
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Resubmission failed. Please retry.');
    } finally {
      setIsResubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>
          Retrieving your scholarship application dossier...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ color: 'var(--color-error)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              ⚠ Unable to Load Status
            </div>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>{error}</p>
            <Button variant="primary" onClick={loadData}>
              Retry Connection
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!application) {
    return (
      <div style={{ maxWidth: '750px', margin: '2rem auto' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              No Active Application Found
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '450px', margin: '0.5rem auto 1.5rem' }}>
              You have not submitted any scholarship application for the current cycle.
            </p>
            <Link to="/applicant/apply" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Submit Application Now</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isRejected = application.status === 'Rejected';
  const isDeficiency = application.status === 'Deficiency Raised';
  const isDuplicate = application.status === 'Flagged - Possible Duplicate' || !!application.duplicateOf;

  // Stepper calculations for positive/active path
  const steps = [
    { label: 'Application Submitted', key: 'Submitted' },
    { label: isDeficiency ? 'Deficiency Raised' : 'Document Review', key: 'Under Review' },
    { label: 'Award Selected', key: 'Selected' }
  ];

  let currentStepIndex = 0;
  if (application.status === 'Under Review' || isDeficiency) currentStepIndex = 1;
  if (application.status === 'Selected') currentStepIndex = 2;

  const flaggedKey = application.flaggedDocument || Object.keys(application.documents || {})[0] || 'casteCertificate';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Application Tracking Status
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Ministry of Tribal Affairs • {application.schemeName || `Scheme ${application.schemeCode || 'ARG45'}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          ↻ Refresh Status
        </Button>
      </div>

      {/* 1. DEFICIENCY RAISED BANNER & RESUBMISSION FORM */}
      {isDeficiency && (
        <div className="deficiency-banner">
          <div className="deficiency-banner-title">
            <span>⚠️</span>
            <span>Action Required: Document Deficiency Raised</span>
          </div>
          <div className="deficiency-banner-content">
            <p>
              The Scrutiny Committee flagged an issue regarding your application (Ref: <strong>{application.id}</strong>).
            </p>
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.85rem 1rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #FDBA74',
                color: '#9A3412',
                fontWeight: 600,
                fontSize: '0.92rem'
              }}
            >
              <strong>Specific Deficiency Reason:</strong> {application.flagReason}
            </div>

            {application.flaggedDocument && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.88rem' }}>
                Affected Document Proof: <strong>{application.flaggedDocument}</strong> (Current: {application.documents?.[application.flaggedDocument] || 'Not attached'})
              </div>
            )}

            {/* Inline Document Resubmission Form */}
            <div className="resubmission-card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#C2410C', marginBottom: '0.35rem' }}>
                📤 Document Correction Resubmission Desk
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Re-upload the corrected version of <strong>{flaggedKey}</strong> to clear this deficiency and resume review.
              </p>

              <form onSubmit={handleResubmit}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Select Corrected Document File
                  </label>
                  <input
                    type="file"
                    className="form-input"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setResubmitFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  {resubmitFileName && (
                    <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>
                      ✓ Selected file: {resubmitFileName}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Clarification / Correction Notes for Scrutiny Desk (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Uploaded revised birth certificate with corrected date of birth."
                    value={resubmissionNote}
                    onChange={(e) => setResubmissionNote(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <Button type="submit" variant="accent" disabled={isResubmitting}>
                    {isResubmitting ? 'Resubmitting Proof...' : 'Submit Corrected Document & Clear Deficiency'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. DUPLICATE SCRUTINY BANNER (if applicant is flagged as potential duplicate) */}
      {isDuplicate && (
        <div className="duplicate-warning-banner">
          <div className="duplicate-warning-title">
            <span>⚠️</span>
            <span>Duplicate Submission Scrutiny in Progress</span>
          </div>
          <div className="duplicate-warning-content">
            <p>
              Your application details have been queued for secondary verification against existing submission records (Reference: {application.duplicateOf || 'Registry Match'}).
            </p>
            <p style={{ marginTop: '0.35rem', fontSize: '0.82rem' }}>
              The MoTA Verification Cell is reviewing cross-scheme records. No applicant action is required at this stage.
            </p>
          </div>
        </div>
      )}

      {/* 3. REJECTED BANNER */}
      {isRejected ? (
        <div className="rejected-banner">
          <div className="rejected-banner-title">
            <span>✕</span>
            <span>Application Rejected by Selection Committee</span>
          </div>
          <div className="rejected-banner-content">
            <p>
              Your fellowship application (Ref: <strong>{application.id}</strong>) was not approved for
              the current award cycle.
            </p>
            {application.remarks && (
              <div
                style={{
                  marginTop: '0.85rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #F5C6CB',
                  fontWeight: 500
                }}
              >
                <strong>Ministry Remarks:</strong> {application.remarks}
              </div>
            )}
            <p style={{ marginTop: '0.85rem', fontSize: '0.85rem', color: '#681b23' }}>
              Applicants with discrepancy queries may raise an official representation to the MoTA Helpdesk
              within 15 working days referencing Scheme Code {application.schemeCode || 'ARG45'}.
            </p>
          </div>
        </div>
      ) : (
        /* Stepper UI for Active Path */
        <div className="stepper-container">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
              Current Evaluation Progress
            </span>
          </div>

          <div className="stepper">
            <div
              className="stepper-progress"
              style={{
                width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                backgroundColor: isDeficiency ? '#EA580C' : 'var(--color-success)'
              }}
            />

            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isActive = index === currentStepIndex;

              return (
                <div
                  key={step.key}
                  className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                >
                  <div
                    className="step-circle"
                    style={{
                      borderColor: isActive && isDeficiency ? '#EA580C' : undefined,
                      color: isActive && isDeficiency ? '#EA580C' : undefined
                    }}
                  >
                    {isCompleted ? '✓' : isActive && isDeficiency ? '⚠' : index === 2 && application.status === 'Selected' ? '✓' : index + 1}
                  </div>
                  <div
                    className="step-label"
                    style={{
                      color: isActive && isDeficiency ? '#C2410C' : undefined,
                      fontWeight: isActive ? 700 : 600
                    }}
                  >
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                    {index === 0 && 'Form & Docs Received'}
                    {index === 1 && (isDeficiency ? 'Action Required' : 'MoTA Scrutiny Cell')}
                    {index === 2 && 'Award Letter Release'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dossier Summary Card */}
      <Card
        title="Candidate Dossier Overview"
        subtitle={`Application ID: ${application.id} • Scheme: ${application.schemeCode || 'ARG45'}`}
        headerAction={<StatusBadge status={application.status} />}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Full Name
            </div>
            <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '0.2rem' }}>
              {application.name}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Date of Birth
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {application.dob}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Enrolled Degree
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {application.course}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Admitted Institution
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {application.institution}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Qualifying Marks
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)', marginTop: '0.2rem' }}>
              {application.marksPercentage}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Statutory Benefit
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-success)', marginTop: '0.2rem' }}>
              {application.fellowshipAmount
                ? application.fellowshipAmount > 100000
                  ? `₹${application.fellowshipAmount.toLocaleString('en-IN')}/yr`
                  : `₹${application.fellowshipAmount.toLocaleString('en-IN')}/mo`
                : '₹28,000/mo'}
            </div>
          </div>

          {application.annualIncome !== null && application.annualIncome !== undefined && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Declared Family Income
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#B45309', marginTop: '0.2rem' }}>
                ₹{Number(application.annualIncome).toLocaleString('en-IN')}/year
              </div>
            </div>
          )}
        </div>

        {/* Special Priority Tag */}
        {application.specialCategory && application.specialCategory !== 'None' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="preference-tag">
              ★ {application.specialCategory} Priority Quota Applied: {application.specialCategoryDetails || 'Document Attached'}
            </span>
          </div>
        )}

        {/* Attached Documents */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Uploaded Application Proofs ({Object.keys(application.documents || {}).length} files):
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {Object.entries(application.documents || {}).map(([key, val]) => (
              <span
                key={key}
                style={{
                  fontSize: '0.82rem',
                  backgroundColor: key === application.flaggedDocument ? '#FFF7ED' : '#F8FAFC',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: key === application.flaggedDocument ? '1px solid #EA580C' : '1px solid var(--color-border)',
                  color: key === application.flaggedDocument ? '#C2410C' : 'inherit'
                }}
              >
                📄 {key}: <strong>{val}</strong>
                {key === application.flaggedDocument && ' (Flagged for Deficiency)'}
              </span>
            ))}
          </div>
        </div>

        {/* Remarks if Under Review or Selected */}
        {!isRejected && application.remarks && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1rem',
              backgroundColor: '#F0F9FF',
              borderLeft: '4px solid var(--color-primary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem'
            }}
          >
            <strong>Scrutiny Cell Audit Note:</strong> {application.remarks}
          </div>
        )}
      </Card>
    </div>
  );
}
