import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  const normalized = (status || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const getLabel = () => {
    switch (normalized) {
      case 'submitted':                  return 'Submitted';
      case 'under-review':               return 'Under Review';
      case 'selected':                   return 'Selected';
      case 'rejected':                   return 'Rejected';
      case 'not-selected':               return 'Not Selected';
      case 'deficiency-raised':          return 'Deficiency Raised';
      case 'flagged-possible-duplicate': return 'Flagged: Duplicate';
      case 'sanction-letter-generated':  return 'Sanction Letter Issued';
      case 'admission-proof-pending':    return 'Admission Proof Pending';
      case 'disbursed':                  return 'Disbursed';
      case 'renewal-pending':            return 'Renewal Pending';
      case 'renewed':                    return 'Renewed';
      default:                           return status || 'Unknown';
    }
  };

  const getSymbol = () => {
    switch (normalized) {
      case 'submitted':                  return '●';
      case 'under-review':               return '⏳';
      case 'selected':                   return '✓';
      case 'rejected':                   return '✕';
      case 'not-selected':               return '✕';
      case 'deficiency-raised':          return '⚠';
      case 'flagged-possible-duplicate': return '⚠️';
      case 'sanction-letter-generated':  return '📄';
      case 'admission-proof-pending':    return '🎓';
      case 'disbursed':                  return '💰';
      case 'renewal-pending':            return '🔄';
      case 'renewed':                    return '✅';
      default:                           return '•';
    }
  };

  return (
    <span className={`status-badge ${normalized} ${className}`.trim()}>
      <span style={{ fontSize: '0.9em', lineHeight: 1 }}>{getSymbol()}</span>
      <span>{getLabel()}</span>
    </span>
  );
}
