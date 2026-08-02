import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Check, Home, Briefcase } from 'lucide-react';
import { useAddressStore } from '../stores/addressStore';

export const Addresses = () => {
  const { addresses, isLoading, fetchAddresses, addAddress, editAddress, deleteAddress, setDefaultAddress } = useAddressStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Form fields state
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    alternatePhone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'Home',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      fullName: '',
      phoneNumber: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      addressType: 'Home',
      isDefault: false
    });
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingAddress(addr);
    setFormData({
      fullName: addr.full_name,
      phoneNumber: addr.phone_number,
      alternatePhone: addr.alternate_phone || '',
      addressLine1: addr.address_line1,
      addressLine2: addr.address_line2 || '',
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postal_code,
      country: addr.country || 'India',
      addressType: addr.address_type || 'Home',
      isDefault: addr.is_default || false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await editAddress(editingAddress.id, formData);
      } else {
        await addAddress(formData);
      }
      setModalOpen(false);
    } catch (err) {
      // Handled by store toasts
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', width: '100%', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--primary-color)', margin: 0 }}>
          My Addresses
        </h1>
        <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Plus size={18} /> Add Address
        </button>
      </div>

      {isLoading && addresses.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="skeleton" style={{ height: '220px' }}></div>
          <div className="skeleton" style={{ height: '220px' }}></div>
        </div>
      ) : addresses.length === 0 ? (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px dashed var(--border-color)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <MapPin size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px' }}>
            No Address Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 16px' }}>
            Please add a shipping address to complete checkout placements.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {addresses.map((addr) => (
            <div
              key={addr.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid',
                borderColor: addr.is_default ? 'var(--secondary-color)' : 'var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative'
              }}
            >
              {/* Header Badges */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  padding: '3px 8px',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {addr.address_type === 'Office' ? <Briefcase size={12} /> : <Home size={12} />}
                  {addr.address_type}
                </span>
                {addr.is_default && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    padding: '3px 8px',
                    backgroundColor: 'rgba(235, 94, 85, 0.1)',
                    color: 'var(--secondary-color)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    Default
                  </span>
                )}
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.0625rem', marginBottom: '4px' }}>
                  {addr.full_name}
                </strong>
                <span>{addr.address_line1}</span>
                {addr.address_line2 && <span>{addr.address_line2}</span>}
                {addr.landmark && <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Landmark: {addr.landmark}</span>}
                <span>{addr.city}, {addr.state} - {addr.postal_code}</span>
                <span>{addr.country}</span>
                <span style={{ marginTop: '8px', color: 'var(--text-primary)' }}>
                  Phone: <strong>{addr.phone_number}</strong>
                </span>
                {addr.alternate_phone && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Alt: {addr.alternate_phone}
                  </span>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '16px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => openEditModal(addr)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => deleteAddress(addr.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--error)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
                {!addr.is_default && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--secondary-color)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginLeft: 'auto',
                      padding: 0
                    }}
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', width: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '24px', textAlign: 'left' }}>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Alternate Mobile</label>
                  <input
                    type="tel"
                    value={formData.alternatePhone}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Address Type</label>
                  <select
                    value={formData.addressType}
                    onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Landmark</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="defaultAddressCheckbox" style={{ margin: 0, cursor: 'pointer' }}>
                  Set as default shipping address
                </label>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '14px' }}>
                  Save Address
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline" style={{ flex: 1, padding: '14px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
