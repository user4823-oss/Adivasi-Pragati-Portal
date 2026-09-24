import React from 'react';

export default function DocumentUpload({
  label,
  id,
  fileName,
  onChange,
  required = false,
  helpText
}) {
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      onChange(file.name);
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
      </label>
      <input
        type="file"
        id={id}
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileChange}
        className="form-input"
        style={{ padding: '0.45rem 0.6rem' }}
      />
      {fileName && (
        <div
          style={{
            marginTop: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <span>✓</span>
          <span>Selected document: <strong>{fileName}</strong></span>
        </div>
      )}
      {helpText && <div className="form-help">{helpText}</div>}
    </div>
  );
}
