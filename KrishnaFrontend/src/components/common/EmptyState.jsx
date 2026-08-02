import React from 'react';
import { PackageX } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageX,
  title = "No Items Found",
  description = "We couldn't find any results matching your request.",
  actionLabel,
  onAction
}) => {
  return (
    <div style={{
      maxWidth: '480px',
      margin: '64px auto',
      padding: '48px 24px',
      textAlign: 'center',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--bg-muted)',
        color: 'var(--primary-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px'
      }}>
        <Icon size={36} />
      </div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)', margin: 0 }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.5', margin: 0 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary"
          style={{ marginTop: '12px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
