import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Eye, XSquare, Calendar, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { toast } from '../stores/toastStore';

export const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data);
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully.');
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel order.';
      toast.error(msg);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return { bg: 'var(--bg-muted)', text: 'var(--text-secondary)' };
      case 'Confirmed': case 'Packed': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' };
      case 'Shipped': case 'Out For Delivery': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
      case 'Delivered': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
      case 'Cancelled': return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--error)' };
      default: return { bg: 'var(--bg-muted)', text: 'var(--text-muted)' };
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '48px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <div className="skeleton" style={{ width: '120px', height: '32px' }}></div>
        <div className="skeleton" style={{ height: '140px' }}></div>
        <div className="skeleton" style={{ height: '140px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', width: '100%', textAlign: 'left' }}>
      
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>My Orders</span>
      </nav>

      <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '32px' }}>
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div style={{
          padding: '64px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px dashed var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-full)', color: 'var(--text-muted)' }}>
            <Package size={48} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>No orders placed yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '360px', margin: 0 }}>
            Once you make purchases, your order tracking status lists will appear here.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '8px' }}>
            Shop Catalogue
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => {
            const date = new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            const colors = getStatusColor(order.status);
            const isCancelable = order.status === 'Pending' || order.status === 'Confirmed';

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '24px',
                  alignItems: 'center'
                }}
                className="order-row-grid"
              >
                {/* Info details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      #{order.order_number}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: colors.bg,
                      color: colors.text
                    }}>
                      {order.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> {date}
                    </span>
                    <span>Items Count: <strong>{order.items_count}</strong></span>
                    <span>Total Paid: <strong style={{ color: 'var(--primary-color)' }}>${parseFloat(order.total_price).toFixed(2)}</strong></span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {isCancelable && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--error)',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <XSquare size={16} /> Cancel Order
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="btn btn-outline"
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}
                  >
                    <Eye size={16} /> Details <ChevronRight size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .order-row-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyOrders;
