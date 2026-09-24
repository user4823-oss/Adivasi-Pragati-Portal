import React from 'react';
import StatusBadge from '../shared/StatusBadge';
import Button from '../shared/Button';

export default function ApplicantTable({ applications = [], onSelectApplicant }) {
  if (!applications || applications.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)' }}>
        No applications found matching criteria.
      </div>
    );
  }

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Application ID</th>
            <th>Applicant Name</th>
            <th>Course</th>
            <th>PG Marks</th>
            <th>Category & Quota</th>
            <th>Status</th>
            <th>Submitted On</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const hasPvtg = app.specialCategory === 'PVTG';
            const hasDivyangan = app.specialCategory === 'Divyangan';

            return (
              <tr
                key={app.id}
                className="table-row-clickable"
                onClick={() => onSelectApplicant && onSelectApplicant(app.id)}
              >
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{app.id}</span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                    Scheme: {app.schemeCode || 'ARG45'}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{app.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    {app.institution}
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: app.course === 'PhD' ? '#EDE7F6' : '#E0F2F1',
                      color: app.course === 'PhD' ? '#4A148C' : '#004D40',
                      fontSize: '0.8rem'
                    }}
                  >
                    {app.course}
                  </span>
                </td>
                <td>
                  <strong>{app.marksPercentage}%</strong>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>ST</span>
                    {hasPvtg && (
                      <span className="preference-tag">
                        ★ PVTG Preference
                      </span>
                    )}
                    {hasDivyangan && (
                      <span className="preference-tag">
                        ♿ Divyangan Preference
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <StatusBadge status={app.status} />
                  {app.duplicateOf && (
                    <div style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 700, marginTop: '0.25rem' }}>
                      ⚠️ Duplicate of {app.duplicateOf}
                    </div>
                  )}
                  {app.status === 'Deficiency Raised' && app.flagReason && (
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: '#C2410C',
                        fontWeight: 600,
                        marginTop: '0.25rem',
                        maxWidth: '180px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={app.flagReason}
                    >
                      ⚠️ {app.flagReason}
                    </div>
                  )}
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {formatDate(app.submittedAt)}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectApplicant) onSelectApplicant(app.id);
                    }}
                  >
                    Review Dossier
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
