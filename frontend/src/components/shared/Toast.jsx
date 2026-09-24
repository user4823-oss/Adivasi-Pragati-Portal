import React, { useEffect } from 'react';

export default function Toast({ message, type = 'error', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeClass = type === 'success' ? 'toast-success' : type === 'info' ? 'toast-info' : 'toast-error';

  return (
    <div className="toast-container">
      <div className={`toast ${typeClass}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{type === 'success' ? '✓' : type === 'info' ? 'ℹ' : '⚠'}</span>
          <span>{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '1.1rem',
              marginLeft: '0.75rem',
              lineHeight: 1
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
