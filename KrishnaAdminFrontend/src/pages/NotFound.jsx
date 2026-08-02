import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        maxWidth: '440px',
        width: '100%',
        padding: '40px 32px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          color: '#64748b',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <FileQuestion size={32} />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
          404 Page Not Found
        </h2>

        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '24px' }}>
          The admin route you requested does not exist.
        </p>

        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: 'hsl(215, 80%, 20%)',
            color: '#ffffff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}
        >
          <Home size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
