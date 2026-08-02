import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 28, label = 'Loading...', fullScreen = false }) => {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      color: '#64748b',
      padding: fullScreen ? 0 : '32px'
    }}>
      <Loader2 size={size} style={{ animation: 'spin 1s linear infinite' }} color="#2563eb" />
      {label && <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{label}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
