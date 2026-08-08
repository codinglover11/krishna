import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, Compass } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '80px 24px', 
      width: '100%', 
      textAlign: 'center', 
      minHeight: '70vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '64px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '150px',
          height: '150px',
          backgroundColor: 'rgba(216, 179, 122, 0.1)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '200px',
          height: '200px',
          backgroundColor: 'rgba(235, 94, 85, 0.05)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            width: '96px', 
            height: '96px', 
            backgroundColor: 'rgba(235, 94, 85, 0.1)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px' 
          }}>
            <Compass size={48} color="var(--error)" />
          </div>
          
          <h1 style={{ 
            fontSize: '6rem', 
            fontWeight: '800', 
            color: 'var(--primary-color)', 
            margin: '0 0 8px 0',
            lineHeight: '1',
            letterSpacing: '-2px'
          }}>
            404
          </h1>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Oops! You've lost your way.
          </h2>
          
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: '1.6' }}>
            The page you're looking for doesn't exist or has been moved. Let's get you back on track to finding the perfect footwear.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-primary"
              style={{ padding: '16px 32px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}
            >
              <Home size={20} />
              Back to Home
            </button>
            
            <button 
              onClick={() => navigate('/products')}
              className="btn btn-outline"
              style={{ padding: '16px 32px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}
            >
              <Search size={20} />
              Browse Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
