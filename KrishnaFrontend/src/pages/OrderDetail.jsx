import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, CreditCard, ShoppingBag, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import api from '../services/api';

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '48px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <div className="skeleton" style={{ width: '140px', height: '32px' }}></div>
        <div className="skeleton" style={{ height: '300px' }}></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: '600px', margin: '64px auto', padding: '0 24px', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>The requested order detail does not exist or access is restricted.</p>
        <Link to="/orders" className="btn btn-primary">Back to My Orders</Link>
      </div>
    );
  }

  const date = new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  // Status progress list helper
  const allStatuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'];
  const isCancelled = order.status === 'Cancelled';
  const isRefunded = order.status === 'Refunded' || order.status === 'Returned';
  
  // Current active status index
  const activeIndex = allStatuses.indexOf(order.status);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', width: '100%', textAlign: 'left' }}>
      
      {/* Back to list */}
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      {/* Header Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)', margin: 0 }}>
            Order #{order.order_number}
          </h1>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <Calendar size={14} /> Placed on {date}
          </span>
        </div>

        <div style={{
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          fontWeight: '700',
          fontSize: '0.875rem',
          backgroundColor: isCancelled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(235, 94, 85, 0.1)',
          color: isCancelled ? 'var(--error)' : 'var(--secondary-color)'
        }}>
          Status: {order.status}
        </div>
      </div>

      {/* Grid: Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }} className="order-details-grid">
        
        {/* Left: Items list & Status timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Timeline */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: '0 0 20px', color: 'var(--text-primary)' }}>Order Timeline</h3>
            
            {isCancelled ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--error)', fontSize: '0.9375rem' }}>
                <CheckCircle2 size={20} />
                <span>This order was Cancelled. Return of inventory items resolved successfully.</span>
              </div>
            ) : isRefunded ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--secondary-color)', fontSize: '0.9375rem' }}>
                <CheckCircle2 size={20} />
                <span>Product items returned. Refund status is active.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {allStatuses.map((step, idx) => {
                  const isDone = idx <= activeIndex;
                  return (
                    <div key={step} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {isDone ? (
                        <CheckCircle2 size={20} style={{ color: 'var(--secondary-color)' }} />
                      ) : (
                        <Circle size={20} style={{ color: 'var(--text-muted)' }} />
                      )}
                      <span style={{
                        fontSize: '0.9375rem',
                        fontWeight: isDone ? '700' : '500',
                        color: isDone ? 'var(--text-primary)' : 'var(--text-muted)'
                      }}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Items Recap */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: '0 0 20px', color: 'var(--text-primary)' }}>Ordered Items</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {order.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                    {item.primary_image ? (
                      <img src={item.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>No image</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{item.product_name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Brand: {item.brand} | Size: {item.size} | Color: {item.color}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.9375rem' }}>
                    <span style={{ display: 'block', fontWeight: '700', color: 'var(--primary-color)' }}>
                      ${parseFloat(item.price_at_purchase).toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Summary breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Shipping Address */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <MapPin size={16} /> Shipping Address
            </h4>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{order.address_name}</strong>
              <span>{order.address_line1}</span>
              {order.address_line2 && <span>{order.address_line2}</span>}
              <span>{order.city}, {order.state} - {order.postal_code}</span>
              <span>Phone: {order.phone_number}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <CreditCard size={16} /> Payment Info
            </h4>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>Method: <strong>{order.payment_method}</strong></span>
              <span>Status: <strong style={{ color: order.payment_status === 'Paid' ? 'var(--success)' : 'inherit' }}>{order.payment_status}</strong></span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 4px' }}>Bill Breakdown</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>${(parseFloat(order.total_price) + parseFloat(order.discount_amount)).toFixed(2)}</span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary-color)' }}>
                  <span>Discounts</span>
                  <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax ({parseFloat(order.tax_amount).toFixed(2)})</span>
                <span>$0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--success)' }}>FREE</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: '700', color: 'var(--primary-color)' }}>
              <span>Grand Total</span>
              <span>${parseFloat(order.total_price).toFixed(2)}</span>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .order-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetail;
