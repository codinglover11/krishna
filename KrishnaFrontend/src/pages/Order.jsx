import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const Order = () => {
  // Fetch customer orders
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/order');
      return response.data; // Array of orders
    },
    retry: false
  });

  const orderList = orders || [];

  if (isLoading) {
    return (
      <div style={{ maxWidth: '800px', margin: '48px auto', padding: '0 24px', width: '100%' }}>
        <div className="skeleton" style={{ height: '200px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px', width: '100%', textAlign: 'left' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Package size={32} /> Order History
      </h1>

      {error && (
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Unable to connect to database to sync order logs.</p>
        </div>
      )}

      {!error && orderList.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 24px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Package size={48} style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', fontWeight: '500' }}>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orderList.map((order) => (
            <div key={order.id} style={{
              padding: '24px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>ORDER ID</span>
                  <h4 style={{ fontWeight: '700', margin: 0 }}>#{order.id.slice(0, 8)}</h4>
                </div>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>STATUS</span>
                  <span style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'hsla(30, 90%, 55%, 0.1)',
                    color: 'var(--secondary-color)',
                    textAlign: 'center'
                  }}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>TOTAL</span>
                  <span style={{ display: 'block', fontWeight: '700' }}>${order.totalPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;
