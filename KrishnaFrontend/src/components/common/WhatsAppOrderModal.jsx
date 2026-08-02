import React, { useState, useEffect } from 'react';
import { X, MessageCircle, MapPin, ExternalLink, User, Phone, MapPin as MapPinIcon } from 'lucide-react';
import { useOrderModalStore } from '../../stores/orderModalStore';
import useAuthStore from '../../stores/authStore';

export const WhatsAppOrderModal = () => {
  const { isOpen, product, closeModal } = useOrderModalStore();
  const { user } = useAuthStore();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setName(user.name || '');
        setPhone(user.phone || '');
        // Usually, the address might not be at the top level of `user`.
        setAddress(user.address || ''); 
      } else {
        setName('');
        setPhone('');
        setAddress('');
      }
      setErrors({});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleWhatsAppSubmit = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!address.trim()) newErrors.address = 'Delivery address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const whatsappNumber = '919079322115';
    
    // Product details might come from Wishlist (item) or ProductDetail/Card (product)
    const pName = product?.name || product?.product_name || 'a product';
    const pPrice = parseFloat(product?.discount_price || product?.price || 0);
    const pImage = product?.primary_image || (product?.images && product?.images[0]?.image_url) || 'No image';

    let whatsappMessage = `*New Order Inquiry*\n\n`;
    whatsappMessage += `*Customer Details*\n`;
    whatsappMessage += `Name: ${name}\n`;
    whatsappMessage += `Phone: ${phone}\n`;
    whatsappMessage += `Address: ${address}\n\n`;
    
    whatsappMessage += `*Product Details*\n`;
    whatsappMessage += `Item: ${pName}\n`;
    if (pPrice > 0) whatsappMessage += `Price: $${pPrice.toFixed(2)}\n`;
    if (pImage !== 'No image') whatsappMessage += `Image: ${pImage}\n`;
    
    whatsappMessage += `\nCould you please help me proceed with this order?`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
    closeModal();
  };

  const lat = 26.8694535;
  const lng = 75.7559061;
  const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const inputStyle = {
    width: '100%',
    padding: '12px 12px 12px 40px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div className="modal-overlay" onClick={closeModal} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '480px', 
          width: '90%',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '32px 24px',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <button
          onClick={closeModal}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#e1fad5', borderRadius: '50%', color: '#25d366' }}>
            <MessageCircle size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-color)', margin: 0 }}>
              Order via WhatsApp
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
              Checkout is currently locked. Secure your order below.
            </p>
          </div>
        </div>

        {/* Selected Product Summary (if available) */}
        {product && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
              {(product.primary_image || (product.images && product.images[0]?.image_url)) ? (
                <img 
                  src={product.primary_image || product.images[0].image_url} 
                  alt={product.name || product.product_name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>No Img</div>
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)' }}>{product.name || product.product_name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--secondary-color)', fontWeight: '700' }}>
                ₹{parseFloat(product.discount_price || product.price || 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Form Fields */}
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Your Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ ...inputStyle, borderColor: errors.name ? '#ef4444' : 'var(--border-color)' }}
            />
            {errors.name && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.name}</div>}
          </div>

          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="tel" 
              placeholder="Phone Number" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ ...inputStyle, borderColor: errors.phone ? '#ef4444' : 'var(--border-color)' }}
            />
            {errors.phone && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.phone}</div>}
          </div>

          <div style={{ position: 'relative' }}>
            <MapPinIcon size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
            <textarea 
              placeholder="Full Delivery Address (incl. City & Pincode)" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'none', borderColor: errors.address ? '#ef4444' : 'var(--border-color)' }}
            />
            {errors.address && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.address}</div>}
          </div>
          
          <button
            onClick={handleWhatsAppSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#25d366',
              color: '#ffffff',
              padding: '16px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '1.125rem',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
              transition: 'transform 0.2s',
              marginTop: '8px'
            }}
          >
            <MessageCircle size={20} /> Proceed to WhatsApp
          </button>

          <a
            href={mapDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            <MapPin size={20} /> Get Store Directions <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppOrderModal;
