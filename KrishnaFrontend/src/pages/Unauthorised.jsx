import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const Unauthorised = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      padding: '24px',
      textAlign: 'center'
    }}>
      <ShieldAlert size={64} style={{ color: 'var(--error)', marginBottom: '24px' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary-color)', margin: '0 0 12px' }}>
        Access Denied
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px' }}>
        You do not have administrative privileges to view this protected layout.
      </p>
      <button onClick={() => navigate('/')} className="btn btn-primary">
        Back to Home
      </button>
    </div>
  );
};

export default Unauthorised;
