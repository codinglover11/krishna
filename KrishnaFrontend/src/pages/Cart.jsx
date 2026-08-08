import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';

export const Cart = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px', width: '100%', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '48px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: 'rgba(216, 179, 122, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px' 
        }}>
          <Clock size={40} color="var(--primary-color)" />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '16px' }}>
          Cart Coming Soon
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
          We are currently building a seamless checkout experience. For now, you can place your orders directly through WhatsApp by clicking "Buy Now" on any product!
        </p>
        <button 
          onClick={() => navigate('/products')}
          className="btn-block"
          style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}
        >
          Explore Collection
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Cart;
