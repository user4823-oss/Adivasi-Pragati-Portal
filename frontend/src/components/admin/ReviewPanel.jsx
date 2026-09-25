import React, { useState } from 'react';
import Card from '../shared/Card';
import StatusBadge from '../shared/StatusBadge';
import Button from '../shared/Button';
import SanctionLetterModal from '../shared/SanctionLetterModal';
import { getMockAnalysisForApplication, STANDARD_DEFICIENCY_REASONS } from '../../data/mockDocumentAnalysis';
import { advanceLifecycle } from '../../services/api';

export default function ReviewPanel({
  application,
  onStatusUpdate,
  isUpdating = false,
  onBack
}) {
  if (!application) return null;

  const [remarks, setRemarks] = useState(application.remarks || '');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showDeficiencyDesk, setShowDeficiencyDesk] = useState(false);
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [isAdvancingLifecycle, setIsAdvancingLifecycle] = useState(false);

  const analysis = getMockAnalysisForApplication(application);

  // Default suggested reason if AI OCR found a mismatch
  const initialReason = analysis?.structuredReason || STANDARD_DEFICIENCY_REASONS[0];
  const [selectedReason, setSelectedReason] = useState(initialReason);
  const [customReason, setCustomReason] = useState('');

  // Target document list
  const docKeys = Object.keys(application.documents || {});
  const [targetDoc, setTargetDoc] = useState(analysis?.flaggedDocument || docKeys[0] || 'casteCertificate');

  const handleAction = async (newStatus, flagReason = null, flaggedDoc = null) => {
    setFeedbackMsg('');
    const success = await onStatusUpdate(application.id, newStatus, remarks, flagReason, flaggedDoc);
    if (success) {
      setFeedbackMsg(`Application status successfully updated to "${newStatus}".`);
      setShowDeficiencyDesk(false);
    }
  };

  const handleRaiseDeficiency = (e) => {
    e.preventDefault();
    const finalReason = selectedReason === 'CUSTOM' ? customReason.trim() : selectedReason;
    if (!finalReason) {
      alert('Please provide a specific deficiency reason.');
      return;
    }
    handleAction('Deficiency Raised', finalReason, targetDoc);
  };

  const handleAdvanceLifecycle = async (nextStatus, note = '') => {
    try {
      setIsAdvancingLifecycle(true);
      setFeedbackMsg('');
      const updated = await advanceLifecycle(application.id, nextStatus, note);
      if (updated) {
        setFeedbackMsg(`Application successfully advanced to lifecycle state: "${nextStatus}".`);
        if (onStatusUpdate) {
          onStatusUpdate(application.id, nextStatus, note);
        }
      }
    } catch (err) {
      alert(`Lifecycle transition failed: ${err.message}`);
    } finally {
      setIsAdvancingLifecycle(false);
    }
  };

  const fellowshipMonthly = application.course === 'M.Phil' ? 25000 : 28000;
  const isDuplicate = application.status === 'Flagged - Possible Duplicate' || !!application.duplicateOf;
  const isDeficiency = application.status === 'Deficiency Raised';

  return (
    <div className="review-panel">
      {onBack && (
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            ← Back to All Applications
          </button>
        </div>
      )}

      {/* 1. DUPLICATE DETECTION PROMINENT WARNING BANNER */}
      {isDuplicate && (
        <div className="duplicate-warning-banner">
          <div className="duplicate-warning-title">
            <span>⚠️</span>
            <span>Automated Fraud & Duplicate Application Flag Detected</span>
          </div>
          <div className="duplicate-warning-content">
            <p>
              This candidate submission matches existing application reference <strong>{application.duplicateOf}</strong> with identical name (<strong>{application.name}</strong>) and Date of Birth (<strong>{application.dob}</strong>).
            </p>
            <p style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>
              <strong>Audit Note:</strong> System recommends verifying candidate registration records to prevent double-claiming across schemes before issuing an approval.
            </p>
          </div>
        </div>
      )}

      {/* 2. ACTIVE DEFICIENCY NOTICE */}
      {isDeficiency && application.flagReason && (
        <div
          style={{
            backgroundColor: '#FFF7ED',
            border: '1px solid #FDBA74',
            borderLeft: '5px solid #EA580C',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            color: '#7C2D12'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>⚠️</span>
            <span>Active Deficiency Issued to Applicant</span>
          </div>
          <div style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>
            <strong>Reason:</strong> {application.flagReason}
          </div>
          {application.flaggedDocument && (
            <div style={{ marginTop: '0.2rem', fontSize: '0.82rem' }}>
              <strong>Flagged Document:</strong> <code>{application.flaggedDocument}</code>
            </div>
          )}
        </div>
      )}

      {/* Header Summary */}
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span className="scheme-tag">Scheme: {application.schemeCode || 'ARG45'}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                ID: {application.id}
              </span>
              {isDuplicate && (
                <span
                  style={{
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #FCD34D'
                  }}
                >
                  Duplicate Match: {application.duplicateOf}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--color-text)', fontWeight: 700 }}>
              {application.name}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              {application.institution}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <StatusBadge status={application.status} />
            </div>
            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                display: 'inline-block'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                Entitled Benefit Rate
              </span>
              <strong style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                {application.fellowshipAmount
                  ? application.fellowshipAmount > 100000
                    ? `₹${application.fellowshipAmount.toLocaleString('en-IN')}/yr`
                    : `₹${application.fellowshipAmount.toLocaleString('en-IN')}/mo`
                  : `₹${fellowshipMonthly.toLocaleString('en-IN')}/mo`}
              </strong>
            </div>
          </div>
        </div>

        {/* Preference / Special Quota Alert */}
        {application.specialCategory === 'PVTG' && (
          <div
            style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #F59E0B',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              color: '#92400E',
              fontSize: '0.9rem'
            }}
          >
            ★ <strong>Particularly Vulnerable Tribal Group (PVTG) Priority:</strong> Candidate belongs to {application.specialCategoryDetails || 'PVTG community'}. Evaluated on statutory affirmative preference queue.
          </div>
        )}

        {application.specialCategory === 'Divyangan' && (
          <div
            style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #3B82F6',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              color: '#1E40AF',
              fontSize: '0.9rem'
            }}
          >
            ♿ <strong>Divyangan (PwD) Priority:</strong> {application.specialCategoryDetails || 'Candidate with certified benchmark disability ≥ 40%'}. Statutory horizontal reservation preference applicable.
          </div>
        )}

        {/* Grid of Applicant Details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-border)'
          }}
        >
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
              Scheme Name
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {application.schemeName || 'NFST Fellowship'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Enrolled Research Degree
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {application.course}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Qualifying Marks Percentage
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)', marginTop: '0.2rem' }}>
              {application.marksPercentage}%
            </div>
          </div>

          {application.annualIncome !== null && application.annualIncome !== undefined && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Declared Family Income
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#B45309', marginTop: '0.2rem' }}>
                ₹{Number(application.annualIncome).toLocaleString('en-IN')}/year
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Submitted Timestamp
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text)', marginTop: '0.2rem' }}>
              {new Date(application.submittedAt).toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Contact Email
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text)', marginTop: '0.2rem' }}>
              {application.applicantEmail}
            </div>
          </div>
        </div>
      </Card>

      {/* AI Document Analysis Block */}
      <Card
        title="Automated AI Document OCR Analysis"
        subtitle="Cross-verification of uploaded documents against government verification registry"
      >
        {analysis ? (
          <div className="ai-analysis-box">
            <div className="ai-header">
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Document Type Recognized:
                </span>
                <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem' }}>
                  {analysis.documentTypeDetected}
                </div>
              </div>

              <div className="ai-confidence-meter">
                <span style={{ color: 'var(--color-text-secondary)' }}>OCR Confidence:</span>
                <span
                  style={{
                    backgroundColor: analysis.confidenceScore > 85 ? 'var(--color-success-bg)' : '#FEE2E2',
                    color: analysis.confidenceScore > 85 ? 'var(--color-success)' : 'var(--color-error)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800
                  }}
                >
                  {analysis.confidenceScore}%
                </span>
              </div>
            </div>

            {/* Extracted vs Stated Comparison */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                margin: '1rem 0',
                padding: '0.85rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Extracted Applicant Name
                </div>
                <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  {analysis.extractedName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Extracted Date of Birth
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    color:
                      analysis.extractedDob !== application.dob
                        ? 'var(--color-error)'
                        : 'var(--color-text)'
                  }}
                >
                  {analysis.extractedDob}{' '}
                  {analysis.extractedDob !== application.dob && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 700 }}>
                      (Form says: {application.dob})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Extracted Caste Classification
                </div>
                <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  {analysis.extractedCategory}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Issuing Competent Authority
                </div>
                <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  {analysis.issuingAuthority}
                </div>
              </div>
            </div>

            {/* Mismatch Alert or Verified Banner */}
            {analysis.mismatch ? (
              <div className="mismatch-alert">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <span>⚠</span>
                    <span>AI Discrepancy Flag: Mismatch Detected</span>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setSelectedReason(analysis.structuredReason || STANDARD_DEFICIENCY_REASONS[0]);
                      setTargetDoc(analysis.flaggedDocument || 'casteCertificate');
                      setShowDeficiencyDesk(true);
                    }}
                  >
                    Raise Deficiency from AI Flag
                  </Button>
                </div>
                <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
                  {analysis.discrepancyDetails}
                </div>
                {analysis.structuredReason && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.82rem', fontWeight: 600 }}>
                    Structured Reason: <em>"{analysis.structuredReason}"</em>
                  </div>
                )}
              </div>
            ) : (
              <div className="match-verified">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <span>✓</span>
                  <span>AI Verification Passed: Document Data Matches Application Details</span>
                </div>
              </div>
            )}

            {/* OCR Highlights list */}
            {analysis.ocrHighlights && analysis.ocrHighlights.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                  Verification Checks Performed:
                </div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text)' }}>
                  {analysis.ocrHighlights.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.2rem' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
            No automated analysis available for this record.
          </div>
        )}

        {/* Uploaded Documents List */}
        <div style={{ marginTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Attached Proof Filenames:
          </h4>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {Object.entries(application.documents || {}).map(([key, val]) => (
              <div
                key={key}
                style={{
                  padding: '0.5rem 0.85rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem'
                }}
              >
                📄 <strong>{key}:</strong> {val}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Reviewer Action Desk */}
      <Card
        title="Ministry Decision Desk"
        subtitle="Approve, Reject, or Flag Deficiency with candidate audit trail"
      >
        {feedbackMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            ✓ {feedbackMsg}
          </div>
        )}

        {/* Deficiency Raising Modal / Inline Desk */}
        {showDeficiencyDesk && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#FFF7ED',
              border: '2px solid #EA580C',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#C2410C' }}>
                ⚠️ Raise Deficiency to Candidate
              </h3>
              <button
                type="button"
                onClick={() => setShowDeficiencyDesk(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9A3412' }}
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#7C2D12', marginBottom: '1rem' }}>
              Flagging a deficiency notifies the applicant with a structured reason and opens a re-upload window for the affected document.
            </p>

            <form onSubmit={handleRaiseDeficiency}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#7C2D12' }}>
                  Target Flagged Document
                </label>
                <select
                  className="form-select"
                  value={targetDoc}
                  onChange={(e) => setTargetDoc(e.target.value)}
                >
                  {docKeys.map((k) => (
                    <option key={k} value={k}>
                      {k} ({application.documents[k]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#7C2D12' }}>
                  Deficiency Reason
                </label>
                <select
                  className="form-select"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  style={{ marginBottom: selectedReason === 'CUSTOM' ? '0.5rem' : 0 }}
                >
                  {analysis?.structuredReason && (
                    <option value={analysis.structuredReason}>
                      [AI OCR Flag] {analysis.structuredReason}
                    </option>
                  )}
                  {STANDARD_DEFICIENCY_REASONS.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="CUSTOM">Custom Deficiency Reason...</option>
                </select>

                {selectedReason === 'CUSTOM' && (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter custom deficiency rationale..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    required
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button variant="outline" size="sm" onClick={() => setShowDeficiencyDesk(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm" disabled={isUpdating}>
                  {isUpdating ? 'Transmitting...' : 'Issue Deficiency Notice'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="remarks" className="form-label">
            Official Ministry Remarks / Committee Notes
          </label>
          <textarea
            id="remarks"
            rows="3"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="form-input"
            placeholder="Provide context for approval, query, or rejection grounds..."
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="success"
            disabled={isUpdating}
            onClick={() => handleAction('Selected')}
          >
            {isUpdating ? 'Processing...' : '✓ Approve & Select (Issue Award)'}
          </Button>

          <Button
            variant="danger"
            disabled={isUpdating}
            onClick={() => handleAction('Rejected')}
          >
            {isUpdating ? 'Processing...' : '✕ Reject Application'}
          </Button>

          <Button
            variant="outline"
            disabled={isUpdating}
            onClick={() => setShowDeficiencyDesk(!showDeficiencyDesk)}
            style={{ borderColor: '#EA580C', color: '#EA580C' }}
          >
            ⚠️ Raise Document Deficiency
          </Button>

          <Button
            variant="outline"
            disabled={isUpdating}
            onClick={() => handleAction('Under Review')}
          >
            ⏳ Mark as Under Review
          </Button>
        </div>
      </Card>

      {/* Post-Selection & DBT Lifecycle Management Card */}
      {['Selected', 'Sanction Letter Generated', 'Admission Proof Pending', 'Disbursed', 'Renewal Pending', 'Renewed'].includes(application.status) && (
        <Card
          title="🏆 Post-Selection & DBT Lifecycle Desk"
          subtitle="Sanction letter generation, university admission verification, PFMS disbursal, and annual renewals"
          headerAction={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSanctionModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <span>📜</span>
              <span>Preview Official Sanction Letter</span>
            </Button>
          }
        >
          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '6px', marginBottom: '1.25rem', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.35rem' }}>
              Current State Machine Stage: <StatusBadge status={application.status} />
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Advance candidate along the Direct Benefit Transfer (DBT) and academic renewal pipeline once procedural checks are fulfilled.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              disabled={isAdvancingLifecycle}
              onClick={() => handleAdvanceLifecycle('Sanction Letter Generated', 'Digital sanction order generated and signed.')}
            >
              1. Issue Sanction Letter
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isAdvancingLifecycle}
              onClick={() => handleAdvanceLifecycle('Admission Proof Pending', 'Foreign/Indian university offer and joining letter queued.')}
            >
              2. Verify Admission Proof
            </Button>

            <Button
              variant="success"
              size="sm"
              disabled={isAdvancingLifecycle}
              onClick={() => handleAdvanceLifecycle('Disbursed', 'Direct Benefit Transfer payout initiated via PFMS.')}
            >
              3. Disburse via DBT
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isAdvancingLifecycle}
              onClick={() => handleAdvanceLifecycle('Renewal Pending', 'Annual academic milestone progress review triggered.')}
            >
              4. Trigger Annual Renewal
            </Button>

            <Button
              variant="primary"
              size="sm"
              disabled={isAdvancingLifecycle}
              onClick={() => handleAdvanceLifecycle('Renewed', 'HOD progress verified; fellowship renewed for next tenure.')}
            >
              5. Confirm Renewed
            </Button>
          </div>
        </Card>
      )}

      {/* Immutable Audit Trail Timeline */}
      {application.auditTrail && application.auditTrail.length > 0 && (
        <Card
          title="🛡️ Tamper-Evident Audit Trail"
          subtitle="Chronological log of all state transitions, verification events, and committee actions"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {application.auditTrail.map((ev, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.85rem'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#E0F2FE',
                    color: '#0369A1',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    flexShrink: 0
                  }}
                >
                  Step {idx + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>
                      {ev.fromStatus ? `${ev.fromStatus} → ` : ''}
                      <span style={{ color: 'var(--color-primary)' }}>{ev.toStatus}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {ev.timestamp ? new Date(ev.timestamp).toLocaleString('en-IN') : '—'}
                    </div>
                  </div>

                  <div style={{ color: '#334155', fontSize: '0.82rem' }}>
                    {ev.reason}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.25rem' }}>
                    Actor: <strong>{ev.changedBy}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Official MoTA Digital Sanction Letter Modal */}
      {showSanctionModal && (
        <SanctionLetterModal
          applicationId={application.id}
          onClose={() => setShowSanctionModal(false)}
        />
      )}
    </div>
  );
}
