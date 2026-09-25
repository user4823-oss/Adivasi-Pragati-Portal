import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Toast from '../../components/shared/Toast';
import { fetchRankedSelection, confirmSelections } from '../../services/api';

export default function QuotaSelectionPage() {
  const [schemeCode, setSchemeCode] = useState('AZKMI'); // Default to NOS to demonstrate quota promotions
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [committeeRemarks, setCommitteeRemarks] = useState('');

  // Local candidate decisions
  const [candidateDecisions, setCandidateDecisions] = useState({});

  const loadSelection = async (code) => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchRankedSelection(code);
      setData(res);
      
      // Initialize decision state
      const initialDecisions = {};
      (res?.candidates || []).forEach((c) => {
        initialDecisions[c.id] = {
          status: c.proposedStatus,
          overrideReason: c.overrideReason || '',
          isOverridden: !!c.overrideReason
        };
      });
      setCandidateDecisions(initialDecisions);
    } catch (err) {
      setError(err.message || 'Unable to load ranked candidate selection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSelection(schemeCode);
  }, [schemeCode]);

  const handleStatusToggle = (candidateId) => {
    setCandidateDecisions((prev) => {
      const current = prev[candidateId];
      const newStatus = current.status === 'Selected' ? 'Not Selected' : 'Selected';
      return {
        ...prev,
        [candidateId]: {
          ...current,
          status: newStatus,
          isOverridden: true,
          overrideReason: current.overrideReason || 'Committee discretionary adjustment'
        }
      };
    });
  };

  const handleReasonChange = (candidateId, reason) => {
    setCandidateDecisions((prev) => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        overrideReason: reason
      }
    }));
  };

  const handleConfirmBatch = async () => {
    if (!data?.candidates?.length) return;

    setIsSubmitting(true);
    setToastMessage('');

    try {
      const payload = data.candidates.map((c) => {
        const dec = candidateDecisions[c.id] || { status: c.proposedStatus };
        return {
          id: c.id,
          status: dec.status,
          overrideReason: dec.isOverridden ? dec.overrideReason : null,
          overriddenBy: dec.isOverridden ? 'Selection Committee' : null
        };
      });

      await confirmSelections(schemeCode, payload, committeeRemarks);
      setToastType('success');
      setToastMessage(`Successfully confirmed selection batch for Scheme ${schemeCode}! Statuses updated in central registry.`);
      await loadSelection(schemeCode);
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Failed to confirm selection batch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const candidates = data?.candidates || [];
  const selectedCount = Object.values(candidateDecisions).filter((d) => d.status === 'Selected').length;
  const quotaAdjustedCount = candidates.filter((c) => c.isQuotaAdjusted).length;

  return (
    <div>
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="scheme-tag">Statutory Selection Desk</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Human-in-the-Loop Quota & Merit Engine
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Quota-Aware Selection Committee Desk
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
            Deterministic ranking with statutory reservation allocations and committee audit trail
          </p>
        </div>

        {/* Scheme Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.35rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setSchemeCode('AZKMI')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: schemeCode === 'AZKMI' ? 'var(--color-primary)' : 'transparent',
              color: schemeCode === 'AZKMI' ? '#FFFFFF' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            NOS Abroad (AZKMI)
          </button>
          <button
            onClick={() => setSchemeCode('ARG45')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: schemeCode === 'ARG45' ? 'var(--color-primary)' : 'transparent',
              color: schemeCode === 'ARG45' ? '#FFFFFF' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            NFST Domestic (ARG45)
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Candidates Evaluated
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.2rem' }}>
            {candidates.length}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Proposed for Selection
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.2rem' }}>
            {selectedCount}
          </div>
        </div>

        {schemeCode === 'AZKMI' && (
          <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#B45309', textTransform: 'uppercase', fontWeight: 700 }}>
              ★ PVTG Quota Promotions
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', marginTop: '0.2rem' }}>
              {quotaAdjustedCount} candidate(s)
            </div>
          </div>
        )}

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Quota Rule Active
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginTop: '0.4rem' }}>
            {schemeCode === 'AZKMI' ? '17 Gen ST + 3 PVTG Earmarked' : 'Pure Merit + Horizontal Flags'}
          </div>
        </div>
      </div>

      {/* Main Candidate Table */}
      <Card
        title={`Ranked Candidates: ${data?.scheme?.schemeName || schemeCode}`}
        subtitle="Rank calculated descending by qualifying marks with statutory quota rules applied."
        headerAction={
          <Button variant="outline" size="sm" onClick={() => loadSelection(schemeCode)}>
            ↻ Re-run Algorithm
          </Button>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-primary)' }}>
            Executing deterministic merit & quota ranking algorithm...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-error)' }}>
            {error}
          </div>
        ) : candidates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)' }}>
            No candidates eligible for selection in the Under Review queue.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Candidate & Dossier</th>
                  <th>Qualifying %</th>
                  <th>Quota Category</th>
                  <th>Algorithm Decision & Reason</th>
                  <th style={{ textAlign: 'center', width: '130px' }}>Status</th>
                  <th style={{ width: '180px' }}>Committee Override</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => {
                  const decision = candidateDecisions[c.id] || { status: c.proposedStatus };
                  const isSelected = decision.status === 'Selected';
                  const isAdjusted = c.isQuotaAdjusted;

                  return (
                    <tr
                      key={c.id}
                      style={{
                        backgroundColor: isAdjusted ? '#FFFDF5' : isSelected ? '#F0FDF4' : undefined
                      }}
                    >
                      <td>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            color: isAdjusted ? '#D97706' : 'var(--color-primary)'
                          }}
                        >
                          #{c.rawRank}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          ID: <code>{c.id}</code> • {c.course}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>
                          {c.marksPercentage}%
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                            backgroundColor: c.specialCategory === 'PVTG' ? '#FEF3C7' : '#E2E8F0',
                            color: c.specialCategory === 'PVTG' ? '#92400E' : '#334155'
                          }}
                        >
                          {c.specialCategory === 'PVTG' ? '★ PVTG' : c.specialCategory === 'Divyangan' ? '♿ Divyangan' : 'General ST'}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.84rem', color: isAdjusted ? '#92400E' : '#334155', fontWeight: isAdjusted ? 700 : 500 }}>
                          {c.quotaReason}
                        </div>
                        {c.preferenceReason && (
                          <div style={{ fontSize: '0.76rem', color: '#1E40AF', marginTop: '0.2rem' }}>
                            {c.preferenceReason}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleStatusToggle(c.id)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '9999px',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#DCFCE7' : '#F1F5F9',
                            color: isSelected ? '#15803D' : '#64748B',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          {isSelected ? '✓ Selected' : '✕ Not Selected'}
                        </button>
                      </td>

                      <td>
                        {decision.isOverridden ? (
                          <input
                            type="text"
                            className="form-input"
                            style={{ fontSize: '0.78rem', padding: '0.25rem 0.5rem' }}
                            placeholder="Override justification..."
                            value={decision.overrideReason}
                            onChange={(e) => handleReasonChange(c.id, e.target.value)}
                          />
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                            Follows Algorithm
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Committee Remarks & Confirm Bar */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ flex: 1, minWidth: '300px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Statutory Selection Committee Audit Remarks
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Committee vetted PVTG quota allocation per Clause 4.2; award list confirmed."
              value={committeeRemarks}
              onChange={(e) => setCommitteeRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="primary"
              disabled={isSubmitting || candidates.length === 0}
              onClick={handleConfirmBatch}
            >
              {isSubmitting ? 'Confirming Batch...' : 'Confirm Selection & Issue Sanctions Batch'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
