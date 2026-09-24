import React from 'react';

export default function Card({
  title,
  subtitle,
  headerAction,
  children,
  className = '',
  ...props
}) {
  return (
    <div className={`card ${className}`.trim()} {...props}>
      {(title || headerAction) && (
        <div className="card-header">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}
