import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, CreditCard, ShoppingBag, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [requiresFee, setRequiresFee] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(0);

  const handleCancelClick = () => {
    const createdTime = new Date(order.created_at).getTime();
    const hoursDiff = (Date.now() - createdTime) / (1000 * 60 * 60);
    setRequiresFee(hoursDiff > 24);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (requiresFee && verificationTimer === 0) {
      setVerificationTimer(10);
      const interval = setInterval(() => {
        setVerificationTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            executeCancel(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return;
    }
    executeCancel(false);
  };

  const executeCancel = async (feePaid) => {
    setIsCancelling(true);
    try {
      await api.post(`/orders/${order.id}/cancel`, { feePaid });
      toast.success('Order cancelled successfully.');
      setShowCancelModal(false);
      const res = await api.get(`/orders/${order.id}`);
      setOrder(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

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

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {order.status === 'Pending' || order.status === 'Confirmed' ? (
            <button onClick={handleCancelClick} style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', backgroundColor: '#fff', border: '1px solid var(--error)', color: 'var(--error)', fontWeight: '600', cursor: 'pointer' }}>
              Cancel Order
            </button>
          ) : null}
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

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '500px', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', color: 'var(--error)' }}>Cancel Order</h2>
            
            {requiresFee ? (
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Since your order was placed more than 24 hours ago, a cancellation fee of <strong>₹50</strong> applies. Please scan the QR code to pay the fee and complete the cancellation.
                </p>
                <div style={{ width: '200px', height: '200px', margin: '0 auto 24px', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src="/payment/paytm_qr.png" alt="Paytm QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                {verificationTimer > 0 ? (
                  <p style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Waiting for payment verification... {verificationTimer}s</p>
                ) : null}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
            )}

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
              <button 
                onClick={() => { setShowCancelModal(false); setVerificationTimer(0); }} 
                disabled={isCancelling || verificationTimer > 0}
                style={{ padding: '12px 24px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '600' }}
              >
                Go Back
              </button>
              <button 
                onClick={handleConfirmCancel}
                disabled={isCancelling || verificationTimer > 0}
                style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', background: 'var(--error)', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
              >
                {isCancelling ? 'Cancelling...' : requiresFee ? (verificationTimer > 0 ? 'Verifying...' : 'I Have Paid') : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
