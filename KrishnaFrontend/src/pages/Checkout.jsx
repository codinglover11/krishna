import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { MapPin, Navigation, IndianRupee, QrCode, CheckCircle, Clock, Search, X, Map, Edit3 } from 'lucide-react';
import { toast } from '../stores/toastStore';
import api from '../services/api';
import { MapLocationPicker } from '../components/common/MapLocationPicker';

export const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { items, subtotal, discount, total, fetchCart, clearCart } = useCartStore();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Address State
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phoneNumber: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: null,
    longitude: null
  });

  // Location Selection State
  const [locationStatus, setLocationStatus] = useState('detecting'); // detecting, detected, denied, manual, search
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasResolvedInitialLocation, setHasResolvedInitialLocation] = useState(false);

  // Delivery State
  const [deliveryInfo, setDeliveryInfo] = useState({ distanceKm: 0, charge: 0, eligible: true, message: '' });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'ONLINE'
  const [timer, setTimer] = useState(120);
  const timerRef = useRef(null);
  
  const [showMap, setShowMap] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [verificationTimer, setVerificationTimer] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart, navigate]);

  useEffect(() => {
    if (step === 3 && paymentMethod === 'ONLINE') {
      const storedTime = localStorage.getItem('kf_payment_timer');
      const storedTimestamp = localStorage.getItem('kf_payment_timestamp');
      let initialTime = 120;
      
      if (storedTime && storedTimestamp) {
        const elapsed = Math.floor((Date.now() - parseInt(storedTimestamp)) / 1000);
        const remaining = parseInt(storedTime) - elapsed;
        initialTime = remaining > 0 ? remaining : 0;
      }
      
      setTimer(initialTime);
      localStorage.setItem('kf_payment_timestamp', Date.now().toString());
      localStorage.setItem('kf_payment_timer', initialTime.toString());

      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            localStorage.removeItem('kf_payment_timer');
            localStorage.removeItem('kf_payment_timestamp');
            return 0;
          }
          localStorage.setItem('kf_payment_timer', (prev - 1).toString());
          localStorage.setItem('kf_payment_timestamp', Date.now().toString());
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [step, paymentMethod]);

  const calculateDelivery = async (lat, lon, addrText = null) => {
    setIsLoading(true);
    try {
      const res = await api.post('/orders/estimate-delivery', { latitude: lat, longitude: lon });
      const { distanceKm, charge, eligible, message } = res.data.data;
      setDeliveryInfo({ distanceKm, charge, eligible, message });
    } catch (err) {
      toast.error('Failed to calculate delivery estimate.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (step === 1 && locationStatus === 'detecting' && !hasResolvedInitialLocation) {
      if (!navigator.geolocation) {
        setLocationStatus('denied');
        setHasResolvedInitialLocation(true);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const addrString = data.display_name || 'Detected Location';
            setAddress(prev => ({
              ...prev,
              latitude,
              longitude,
              addressLine1: addrString
            }));
            await calculateDelivery(latitude, longitude, addrString);
            setLocationStatus('detected');
            setHasResolvedInitialLocation(true);
          } catch (err) {
            setLocationStatus('denied');
            setHasResolvedInitialLocation(true);
          }
        },
        (err) => {
          setLocationStatus('denied');
          setHasResolvedInitialLocation(true);
        },
        { timeout: 10000 }
      );
    }
  }, [step, locationStatus, hasResolvedInitialLocation]);

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      toast.error('Search failed. Try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    const addrString = suggestion.display_name;
    
    setAddress(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      addressLine1: addrString
    }));
    
    await calculateDelivery(lat, lon, addrString);
    setLocationStatus('detected');
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleResetLocation = () => {
    setLocationStatus('denied');
    setDeliveryInfo({ distanceKm: 0, charge: 0, eligible: true, message: '' });
  };

  const handleLocationSelect = (loc) => {
    setAddress(prev => ({
      ...prev,
      latitude: loc.latitude,
      longitude: loc.longitude,
      addressLine1: loc.addressLine1 || prev.addressLine1,
      city: loc.city || prev.city,
      state: loc.state || prev.state,
      postalCode: loc.postalCode || prev.postalCode
    }));
    setShowMap(false);
    toast.success('Address coordinates pinpointed successfully!');
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!address.addressLine1 || !address.city || !address.state || !address.postalCode) {
      toast.warning('Please fill all required address fields.');
      return;
    }

    let lat = address.latitude;
    let lon = address.longitude;

    if (!lat || !lon) {
      // Fallback Geocoding
      setIsLoading(true);
      try {
        const query = encodeURIComponent(`${address.addressLine1}, ${address.city}, ${address.state}`);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lon = parseFloat(data[0].lon);
          setAddress(prev => ({ ...prev, latitude: lat, longitude: lon }));
        } else {
          throw new Error('Address not found');
        }
      } catch (err) {
        toast.warning('Exact address verification failed, applying standard delivery rate.');
        // Don't return, let the backend handle the fallback with null coordinates
      }
      setIsLoading(false);
    }

    // Get Delivery Estimate
    setIsLoading(true);
    try {
      const res = await api.post('/orders/estimate-delivery', { latitude: lat, longitude: lon });
      const { distanceKm, charge, eligible, message } = res.data.data;
      setDeliveryInfo({ distanceKm, charge, eligible, message });
      if (eligible) {
        toast.success('Delivery available! Proceeding to payment.');
        setStep(3);
      } else {
        toast.error(message || 'Delivery unavailable for this location.');
      }
    } catch (err) {
      toast.error('Failed to calculate delivery estimate.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (step === 3 && paymentMethod === 'ONLINE' && timer === 0) {
      toast.error('Payment session expired. Please refresh and try again.');
      return;
    }

    executeOrderPlacement();
  };

  const executeOrderPlacement = async () => {
    setIsLoading(true);
    try {
      // Create Address
      const addressRes = await api.post('/addresses', address);
      const addressId = addressRes.data.data.id;

      // Create Order
      const orderRes = await api.post('/orders', {
        addressId,
        paymentMethod
      });
      const orderId = orderRes.data.data.id;

      if (paymentMethod === 'ONLINE') {
        setVerificationTimer(120);
        let currentTimer = 120;
        
        const interval = setInterval(async () => {
          currentTimer -= 1;
          
          if (currentTimer <= 0) {
            clearInterval(interval);
            setVerificationTimer(0);
            api.get(`/orders/verify-payment/${orderId}?action=decline`).catch(() => {});
            toast.error('Payment verification timed out. Order cancelled.');
            return;
          }
          
          setVerificationTimer(currentTimer);
          
          if (currentTimer % 5 === 0) {
            try {
              const checkRes = await api.get(`/orders/${orderId}`);
              const currentStatus = checkRes.data.data.payment_status;
              
              if (currentStatus === 'Paid') {
                clearInterval(interval);
                setVerificationTimer(0);
                toast.success('Payment verified and order placed successfully!');
                setSnapshot({ items, subtotal, total, orderId });
                clearCart();
                setStep(4);
              } else if (currentStatus === 'Payment_Failed' || currentStatus === 'Cancelled') {
                clearInterval(interval);
                setVerificationTimer(0);
                toast.error('Payment was declined by admin.');
              }
            } catch (err) {
              console.error('Polling error', err);
            }
          }
        }, 1000);
      } else {
        toast.success('Order placed successfully!');
        setSnapshot({ items, subtotal, total, orderId });
        clearCart();
        setStep(4);
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to place order.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const finalTotal = total + deliveryInfo.charge;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', minHeight: '70vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '32px' }}>Checkout</h1>

      {/* Progress Indicator */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
        {['Location & Address', 'Payment', 'Done'].map((lbl, idx) => {
          const actualStep = idx === 0 ? 1 : idx === 1 ? 3 : 4;
          return (
            <div key={lbl} style={{ flex: 1, borderBottom: `4px solid ${step >= actualStep ? 'var(--primary-color)' : '#e2e8f0'}`, paddingBottom: '8px', color: step >= actualStep ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: '600' }}>
              {idx + 1}. {lbl}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
        
        {/* Left Column - Forms */}
        <div>
          {/* Step 1: Location & Address */}
          {step === 1 && (
            <div style={{ backgroundColor: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Delivery Location</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem', color: 'var(--primary-color)' }}>1. Pinpoint Location on Map</h3>
                  {address.latitude && address.longitude ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle size={18} /> Location Confirmed
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{address.addressLine1}</p>
                      </div>
                      <button onClick={() => setShowMap(true)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--line)', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '500' }}>
                        Change
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        Please select your exact delivery location on the map to help us deliver accurately and check delivery eligibility.
                      </p>
                      <button onClick={() => setShowMap(true)} className="btn-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Map size={20} /> Select Location on Map
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '8px', opacity: address.latitude ? 1 : 0.6, pointerEvents: address.latitude ? 'auto' : 'none' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem', color: 'var(--primary-color)' }}>2. Address Details</h3>
                  <form onSubmit={handleAddressSubmit} style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <input required placeholder="Full Name" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} style={{ padding: '12px', border: '1px solid var(--line)', borderRadius: '6px' }} />
                      <input required placeholder="Mobile Number" value={address.phoneNumber} onChange={e => setAddress({...address, phoneNumber: e.target.value})} style={{ padding: '12px', border: '1px solid var(--line)', borderRadius: '6px' }} />
                    </div>
                    <input required placeholder="House / Flat No." value={address.addressLine2} onChange={e => setAddress({...address, addressLine2: e.target.value})} style={{ padding: '12px', border: '1px solid var(--line)', borderRadius: '6px' }} />
                    <input required placeholder="Area / Locality / Street" value={address.addressLine1} onChange={e => setAddress({...address, addressLine1: e.target.value})} style={{ padding: '12px', border: '1px solid var(--line)', borderRadius: '6px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <input required placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} style={{ padding: '12px', border: '1px solid var(--line)', borderRadius: '6px' }} />
                      <input required placeholder="State" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} style={{ padding: '12px', border: '1px solid var(--line)', borderRadius: '6px' }} />
                    </div>
                    <input required placeholder="Pincode" value={address.postalCode} onChange={e => setAddress({...address, postalCode: e.target.value})} style={{ padding: '12px', border: '1px solid var(--line)', borderRadius: '6px' }} />
                    
                    {deliveryInfo.message && (
                      <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: deliveryInfo.eligible ? '#f0fdf4' : '#fef2f2', color: deliveryInfo.eligible ? '#16a34a' : '#dc2626', fontSize: '0.9375rem', fontWeight: '500' }}>
                        {deliveryInfo.eligible ? <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> : <X size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />}
                        {deliveryInfo.message} {deliveryInfo.distanceKm > 0 && `(Distance: ${deliveryInfo.distanceKm} km)`}
                      </div>
                    )}

                    <button type="submit" disabled={isLoading} className="btn-block" style={{ marginTop: '16px' }}>
                      {isLoading ? 'Checking...' : 'Check Delivery & Continue'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div style={{ backgroundColor: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Select Payment Method</h2>
              
              <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '24px', border: `2px solid ${paymentMethod === 'COD' ? 'var(--primary-color)' : 'var(--line)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ width: '20px', height: '20px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IndianRupee size={24} color={paymentMethod === 'COD' ? 'var(--primary-color)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>Cash on Delivery</span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '24px', border: `2px solid ${paymentMethod === 'ONLINE' ? 'var(--primary-color)' : 'var(--line)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="payment" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} style={{ width: '20px', height: '20px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <QrCode size={24} color={paymentMethod === 'ONLINE' ? 'var(--primary-color)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>Online Payment (UPI / QR)</span>
                  </div>
                </label>
              </div>

              {paymentMethod === 'ONLINE' && verificationTimer === 0 && (
                <div style={{ padding: '32px', backgroundColor: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--line)', marginBottom: '32px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem' }}>Scan QR to Pay</h3>
                  <div style={{ width: '200px', height: '200px', backgroundColor: '#e2e8f0', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src="/payment/paytm_qr.png" alt="Paytm QR" onError={(e) => { e.target.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    {!document.querySelector('img[src="/payment/paytm_qr.png"]')?.complete && (
                       <div style={{ color: 'var(--text-muted)' }}>[ DUMMY QR IMAGE ]</div>
                    )}
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 16px 0' }}>₹{finalTotal.toLocaleString()}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: timer > 0 ? '#b45309' : '#dc2626', fontWeight: '600', backgroundColor: timer > 0 ? '#fef3c7' : '#fee2e2', padding: '12px', borderRadius: '8px', display: 'inline-flex' }}>
                    <Clock size={20} />
                    {timer > 0 ? `Payment Window: ${formatTime(timer)}` : 'Payment session expired!'}
                  </div>
                </div>
              )}

              <button 
                onClick={handlePlaceOrder} 
                disabled={isLoading || (paymentMethod === 'ONLINE' && timer === 0) || verificationTimer > 0}
                className="btn-block"
              >
                {isLoading ? 'Processing...' : paymentMethod === 'ONLINE' ? (verificationTimer > 0 ? `Waiting for Admin to Verify... ${verificationTimer}s` : "I've Completed Payment") : 'Confirm Order'}
              </button>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div style={{ backgroundColor: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '48px 32px', textAlign: 'center' }}>
              <CheckCircle size={64} color="#16a34a" style={{ margin: '0 auto 24px auto' }} />
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#16a34a', marginBottom: '16px' }}>Order Placed Successfully!</h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
                Thank you for your purchase. You will receive an order confirmation email shortly.
              </p>
              <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', textAlign: 'left', marginBottom: '40px', display: 'grid', gap: '16px' }}>
                <div>
                   <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Expected Delivery</p>
                   <p style={{ margin: '0', fontSize: '1.125rem', fontWeight: '600' }}>Within 7 days</p>
                </div>
                <div>
                   <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Delivery Address</p>
                   <p style={{ margin: '0', fontSize: '1rem', fontWeight: '500' }}>
                     {address.fullName}<br/>
                     {address.addressLine2}, {address.addressLine1}<br/>
                     {address.city}, {address.state} - {address.postalCode}
                   </p>
                </div>
              </div>
              <br />
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button onClick={() => navigate('/products')} style={{ padding: '12px 32px', backgroundColor: 'transparent', color: 'var(--primary-color)', borderRadius: '8px', fontWeight: '600', border: '1px solid var(--primary-color)', cursor: 'pointer' }}>
                  Continue Shopping
                </button>
                {snapshot?.orderId && (
                  <button onClick={() => navigate(`/orders/${snapshot.orderId}`)} style={{ padding: '12px 32px', backgroundColor: 'var(--primary-color)', color: '#fff', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                    Track Order Status
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div style={{ position: 'sticky', top: '24px', backgroundColor: '#f8fafc', borderRadius: '16px', padding: '32px', border: '1px solid var(--line)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 24px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {(step === 4 && snapshot ? snapshot.items : items).map((item) => (
              <div key={`summary-${item.cartItemId}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ flex: 1, paddingRight: '16px' }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                    {item.productName}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                    Qty: {item.quantity} × ₹{(parseFloat(item.discountPrice || item.unitPrice)).toLocaleString()}
                  </div>
                </div>
                <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                  ₹{((parseFloat(item.discountPrice || item.unitPrice)) * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed #cbd5e1', margin: '24px 0' }}></div>
          {address.fullName && (
            <div style={{ marginBottom: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>Delivering to:</div>
              <div>{address.fullName} - {address.phoneNumber}</div>
              <div>{address.addressLine2}, {address.addressLine1}</div>
              <div>{address.city}, {address.state} - {address.postalCode}</div>
            </div>
          )}
          <div style={{ borderTop: '1px dashed #cbd5e1', margin: '24px 0' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>₹{(step === 4 && snapshot ? snapshot.subtotal : subtotal).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery Charge</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {step > 1 ? `₹${deliveryInfo.charge}` : 'Calculated next step'}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Total</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-color)' }}>
              ₹{step > 1 ? ((step === 4 && snapshot ? snapshot.total : total) + deliveryInfo.charge).toLocaleString() : (step === 4 && snapshot ? snapshot.total : total).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {showMap && (
        <MapLocationPicker 
          onLocationSelect={handleLocationSelect} 
          onCancel={() => setShowMap(false)} 
        />
      )}
    </div>
  );
};

export default Checkout;
