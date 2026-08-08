import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { FormSelect, FormTextarea } from '../components/common/FormComponents';
import { ArrowLeft, Package, User, MapPin, CreditCard, Clock, CheckCircle2, Truck, ShieldAlert, Edit3 } from 'lucide-react';

const ALLOWED_STATUSES = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out For Delivery',
  'Delivered',
  'Cancelled',
  'Returned',
  'Refunded'
];

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status Change Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('Pending');
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdminOrderById(id);
      setOrder(data);
      setNewStatus(data.status);
    } catch (err) {
      toast.error('Failed to load order details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!order) return;

    setIsUpdating(true);
    try {
      await adminService.updateOrderStatus(order.id, newStatus, adminNote);
      toast.success(`Order status updated to ${newStatus}!`);
      setModalOpen(false);
      fetchOrderDetails();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update order status.';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading Order Details..." />;
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Order Not Found</h2>
        <Link to="/orders">Return to Orders</Link>
      </div>
    );
  }

  const address = order.address || {};
  const items = order.items || [];
  const history = order.status_history || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-soft)', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--ink)', margin: 0, fontFamily: '"Rozha One", serif' }}>
            Order #{order.order_number || order.id.slice(0, 8)}
          </h1>
        </div>

        <button
          onClick={() => { setNewStatus(order.status); setAdminNote(''); setModalOpen(true); }}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--chestnut)',
            color: 'var(--parchment)',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '700',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <Edit3 size={18} /> Update Status ({order.status})
        </button>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Products & Status Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Ordered Products Table Card */}
          <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color="#2563eb" /> Ordered Products ({items.length})
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'var(--parchment-soft)', borderBottom: '1px solid var(--line)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Item</th>
                    <th style={{ padding: '12px 16px' }}>Variant</th>
                    <th style={{ padding: '12px 16px' }}>Qty</th>
                    <th style={{ padding: '12px 16px' }}>Price</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const price = parseFloat(item.price_at_purchase || 0);
                    const total = price * item.quantity;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--parchment-soft)', overflow: 'hidden', flexShrink: 0 }}>
                              {item.primary_image ? (
                                <img src={item.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Package size={20} color="var(--ink-soft)" />
                              )}
                            </div>
                            <div>
                              <strong style={{ display: 'block', color: 'var(--ink)' }}>{item.product_name}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>SKU: {item.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {item.size_label || 'Standard'} | {item.color_name || 'Standard'}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '700' }}>{item.quantity}</td>
                        <td style={{ padding: '12px 16px' }}>₹{price.toFixed(2)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: 'var(--ink)' }}>
                          ₹{total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Timeline Card */}
          <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#d97706" /> Order Status History & Log
            </h3>

            {history.length === 0 ? (
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem' }}>No status history recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid var(--line)', paddingLeft: '16px', marginLeft: '8px' }}>
                {history.map((h, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-23px',
                      top: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: idx === history.length - 1 ? 'var(--brass)' : 'var(--line)'
                    }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--ink)' }}>{h.status}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--ink-soft)' }}>
                      {h.notes || `Status changed to ${h.status}`} (By: {h.created_by_name || 'Admin'})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Customer Info, Shipping Address, Payment Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Customer Info Card */}
          <div style={{ padding: '20px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#2563eb" /> Customer Profile
            </h4>
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong style={{ color: 'var(--ink)' }}>Name:</strong> {order.customer_name}</div>
              <div><strong style={{ color: 'var(--ink)' }}>Email:</strong> {order.customer_email}</div>
              <Link to={`/customers/${order.user_id}`} style={{ fontSize: '0.8125rem', color: 'var(--brass)', fontWeight: '600', marginTop: '4px', textDecoration: 'none' }}>
                View Customer History →
              </Link>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div style={{ padding: '20px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#10b981" /> Shipping Address
            </h4>
            {address.full_name ? (
              <div style={{ fontSize: '0.875rem', color: 'var(--ink-soft)', lineHeight: '1.5' }}>
                <strong style={{ color: 'var(--ink)' }}>{address.full_name}</strong> ({address.address_type || 'Home'})<br />
                {address.address_line1}<br />
                {address.address_line2 && <>{address.address_line2}<br /></>}
                {address.city}, {address.state} - {address.postal_code}<br />
                {address.country || 'India'}<br />
                <strong style={{ color: 'var(--ink)' }}>Phone:</strong> {address.phone_number}
              </div>
            ) : (
              <span style={{ color: 'var(--ink-soft)', fontSize: '0.875rem' }}>No address info attached</span>
            )}
          </div>

          {/* Payment & Price Breakdown Card */}
          <div style={{ padding: '20px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="#f59e0b" /> Payment Summary
            </h4>
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Payment Method:</span>
                <strong style={{ color: 'var(--ink)' }}>{order.payment_method || 'COD'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Payment Status:</span>
                <span style={{ fontWeight: '700', color: order.payment_status === 'Paid' ? 'var(--bottle)' : 'var(--brass)' }}>
                  {order.payment_status}
                </span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Subtotal:</span>
                <span style={{ color: 'var(--ink)' }}>₹{(parseFloat(order.total_price) + parseFloat(order.discount_amount || 0) - parseFloat(order.shipping_amount || 0)).toFixed(2)}</span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bottle)' }}>
                  <span>Discount:</span>
                  <span>-₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Shipping / Delivery Charge:</span>
                <span style={{ color: 'var(--ink)' }}>{parseFloat(order.delivery_charge || order.shipping_amount) > 0 ? `₹${parseFloat(order.delivery_charge || order.shipping_amount).toFixed(2)}` : 'FREE'}</span>
              </div>
              {order.delivery_distance && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--ink-soft)' }}>Delivery Distance:</span>
                  <span style={{ color: 'var(--ink)' }}>{order.delivery_distance} km</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: '800', color: 'var(--ink)', marginTop: '4px' }}>
                <span>Grand Total:</span>
                <span>₹{parseFloat(order.total_price).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Change Status Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Update Status: Order #${order.order_number}`}
        footer={(
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--line)', backgroundColor: 'var(--card)', cursor: 'pointer', color: 'var(--ink)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={isUpdating}
              style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--chestnut)', color: 'var(--parchment)', fontWeight: '700', cursor: 'pointer' }}
            >
              {isUpdating ? 'Saving...' : 'Save Status Update'}
            </button>
          </>
        )}
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <FormSelect
            label="New Order Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={ALLOWED_STATUSES.map((st) => ({ value: st, label: st }))}
          />
          <FormTextarea
            label="Admin Status Note / Reason"
            placeholder="e.g. Order confirmed and dispatched via BlueDart Express."
            rows={3}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
        </form>
      </Modal>

    </div>
  );
};

export default OrderDetail;
