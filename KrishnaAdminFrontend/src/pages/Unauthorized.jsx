import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        maxWidth: '480px',
        width: '100%',
        padding: '40px 32px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fef2f2',
          color: '#ef4444',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <ShieldAlert size={36} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 12px' }}>
          403 Access Denied
        </h1>

        <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: '1.6', margin: '0 0 24px' }}>
          Your account credentials do not possess administrative permissions required to access the Krishna Footwear Admin Portal.
        </p>

        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: 'hsl(215, 80%, 20%)',
            color: '#ffffff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.9375rem'
          }}
        >
          <ArrowLeft size={16} /> Return to Login
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
