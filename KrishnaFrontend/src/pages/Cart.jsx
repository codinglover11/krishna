import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const Cart = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%', textAlign: 'left', minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Shopping Cart</span>
      </nav>

      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '32px' }}>
        Shopping Cart
      </h1>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          icon={Construction}
          title="We are working on it"
          description="The shopping cart functionality is currently under construction. Please check our products in the meantime!"
          actionLabel="View Products"
          onAction={() => navigate('/products')}
        />
      </div>

    </div>
  );
};

export default Cart;
