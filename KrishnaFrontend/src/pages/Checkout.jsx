import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Plus, CreditCard, ShoppingBag, Check, Ticket, X, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAddressStore } from '../stores/addressStore';
import { toast } from '../stores/toastStore';
import api from '../services/api';

export const Checkout = () => {
  const navigate = useNavigate();
  const { items: cartItems, subtotal, discount: cartDiscount, total: cartTotal, fetchCart } = useCartStore();
  const { addresses, isLoading: addressLoading, fetchAddresses } = useAddressStore();
  
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { coupon, discountAmount, finalTotal }

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) {
      toast.warning('Please enter a coupon code.');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await api.post('/coupons/validate', {
        code: couponCodeInput.trim(),
        subtotal
      });
      const data = response.data.data;
      setAppliedCoupon(data);
      toast.success(response.data.message || `Coupon "${data.coupon.code}" applied!`);
    } catch (error) {
      console.error('Coupon validation failed:', error);
      const msg = error.response?.data?.message || 'Invalid or expired coupon code.';
      toast.error(msg);
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    toast.info('Coupon code removed.');
  };

  const currentCouponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, cartTotal - currentCouponDiscount);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Your shopping cart is empty.');
      return;
    }
    if (!selectedAddressId) {
      toast.warning('Please select a shipping address first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/orders', {
        addressId: selectedAddressId,
        paymentMethod: 'COD',
        couponId: appliedCoupon ? appliedCoupon.coupon.id : null,
        couponCode: appliedCoupon ? appliedCoupon.coupon.code : null,
        couponDiscount: currentCouponDiscount
      });

      const order = response.data.data;
      toast.success('Success! Your order has been placed.');
      
      // Reload cart to clear items locally
      await fetchCart();

      // Redirect to Order Success Page
      navigate('/order-success', { state: { orderNumber: order.order_number } });
    } catch (error) {
      console.error('Order placement failed:', error);
      const msg = error.response?.data?.message || 'Failed to place order.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '64px auto', padding: '0 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '16px', color: 'var(--primary-color)' }}>Checkout Not Available</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Your shopping cart is currently empty.</p>
        <Link to="/products" className="btn btn-primary">Browse Catalogue</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%', textAlign: 'left' }}>
      
      <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '32px' }}>
        Secure Checkout
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }} className="checkout-grid">
        
        {/* Left: Address & Payment selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Shipping Address Selection */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--primary-color)' }}>
                <MapPin size={20} style={{ color: 'var(--secondary-color)' }} /> 1. Shipping Address
              </h3>
              <Link to="/addresses" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--secondary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> Manage Addresses
              </Link>
            </div>

            {addressLoading && addresses.length === 0 ? (
              <div className="skeleton" style={{ height: '120px' }}></div>
            ) : addresses.length === 0 ? (
              <div style={{ padding: '20px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 12px' }}>No address found. Please add a shipping address to place orders.</p>
                <Link to="/addresses" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>Add Address</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid',
                      borderColor: selectedAddressId === addr.id ? 'var(--primary-color)' : 'var(--border-color)',
                      backgroundColor: selectedAddressId === addr.id ? 'var(--bg-muted)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="shippingAddress"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      style={{ marginTop: '4px', accentColor: 'var(--primary-color)' }}
                    />
                    <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{addr.full_name} ({addr.address_type})</strong>
                      <span>{addr.address_line1}, {addr.address_line2}</span>
                      <span>{addr.city}, {addr.state} - {addr.postal_code}</span>
                      <span>Phone: {addr.phone_number}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 20px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--primary-color)' }}>
              <CreditCard size={20} style={{ color: 'var(--secondary-color)' }} /> 2. Payment Method
            </h3>
            
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--secondary-color)',
              backgroundColor: 'var(--bg-muted)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <Check size={18} style={{ color: 'var(--secondary-color)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Cash On Delivery (COD)</strong>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Pay with cash upon package delivery to your address.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Order Summary Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'sticky',
            top: '90px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} /> Order Summary
            </h3>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

            {/* Compact Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
              {cartItems.map((item) => (
                <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '70%' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {item.productName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                    </span>
                  </div>
                  <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                    ${item.totalPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

            {/* Coupon Promo Input Box */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <Ticket size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Have a Promo Coupon Code?
              </label>

              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--success-bg)', border: '1px border-dashed var(--success)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <strong style={{ color: 'var(--success)', fontSize: '0.875rem', display: 'block' }}>{appliedCoupon.coupon.code}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Saved ${appliedCoupon.discountAmount.toFixed(2)}</span>
                  </div>
                  <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }} title="Remove Coupon">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter Code (e.g. KRISHNA20)"
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem', fontWeight: '700' }}
                  />
                  <button
                    type="submit"
                    disabled={isValidatingCoupon || !couponCodeInput.trim()}
                    className="btn btn-outline"
                    style={{ padding: '8px 16px', fontSize: '0.875rem', fontWeight: '700' }}
                  >
                    {isValidatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

            {/* Price lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9375rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {currentCouponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: '700' }}>
                  <span>Coupon Discount ({appliedCoupon.coupon.code})</span>
                  <span>-${currentCouponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Estimated Tax</span>
                <span>$0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Shipping Charges</span>
                <span style={{ color: 'var(--success)', fontWeight: '600' }}>FREE</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-color)' }}>
              <span>Grand Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>

            <button
              disabled={isSubmitting || !selectedAddressId}
              onClick={handlePlaceOrder}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1rem',
                cursor: (isSubmitting || !selectedAddressId) ? 'not-allowed' : 'pointer',
                opacity: (isSubmitting || !selectedAddressId) ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Placing Order...' : 'Place COD Order'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              <ShieldCheck size={16} /> Guaranteed 256-Bit SSL Encryption
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
