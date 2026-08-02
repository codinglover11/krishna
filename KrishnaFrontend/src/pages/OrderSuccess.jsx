import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';

export const OrderSuccess = () => {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || 'KF-ORDER-PENDING';

  return (
    <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <div style={{ color: 'var(--success)' }}>
        <CheckCircle size={64} />
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', margin: 0 }}>
        Order Placed!
      </h1>

      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
        Thank you for your purchase. We have received your order details. Your items are being prepared for confirmed dispatch.
      </p>

      <div style={{
        backgroundColor: 'var(--bg-muted)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 32px',
        fontSize: '1.125rem',
        fontWeight: '700',
        color: 'var(--text-primary)'
      }}>
        Order ID: <span style={{ color: 'var(--secondary-color)' }}>{orderNumber}</span>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/orders" className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          View My Orders <ArrowRight size={16} />
        </Link>
        <Link to="/" className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ShoppingBag size={16} /> Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
