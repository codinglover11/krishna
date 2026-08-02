import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Plus, Edit2, Trash2, Ticket, Calendar, DollarSign, Percent, ShieldCheck, Users } from 'lucide-react';

export const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    usagePerUser: 1,
    startDate: '',
    expiresAt: '',
    isActive: true
  });

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdminCoupons();
      setCoupons(data || []);
    } catch (err) {
      toast.error('Failed to load coupons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discountType: coupon.discount_type || (coupon.is_percentage ? 'percentage' : 'flat'),
        discountValue: coupon.discount_value || '',
        minOrderAmount: coupon.min_order_amount || '',
        maxDiscountAmount: coupon.max_discount_amount || '',
        usageLimit: coupon.usage_limit || '',
        usagePerUser: coupon.usage_per_user || 1,
        startDate: coupon.start_date ? coupon.start_date.split('T')[0] : '',
        expiresAt: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
        isActive: coupon.is_active !== false
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        usageLimit: '',
        usagePerUser: 1,
        startDate: '',
        expiresAt: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      toast.error('Please enter coupon code and discount value.');
      return;
    }

    try {
      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon.id, formData);
        toast.success('Coupon updated successfully.');
      } else {
        await adminService.createCoupon(formData);
        toast.success('Coupon created successfully.');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promo coupon code?')) return;
    try {
      await adminService.deleteCoupon(id);
      toast.success('Coupon deleted.');
      fetchCoupons();
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  const columns = [
    {
      header: 'Coupon Code',
      accessor: 'code',
      render: (row) => (
        <div>
          <span style={{
            display: 'inline-block',
            padding: '4px 10px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            border: '1px border-dashed #93c5fd',
            borderRadius: '6px',
            fontWeight: '800',
            fontSize: '0.875rem',
            letterSpacing: '0.5px'
          }}>
            {row.code}
          </span>
          {row.description && <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{row.description}</span>}
        </div>
      )
    },
    {
      header: 'Discount',
      accessor: 'discount_value',
      render: (row) => (
        <span style={{ fontWeight: '800', color: '#10b981', fontSize: '0.9375rem' }}>
          {row.discount_type === 'flat' || !row.is_percentage ? `$${parseFloat(row.discount_value).toFixed(2)} FLAT` : `${parseFloat(row.discount_value).toFixed(0)}% OFF`}
        </span>
      )
    },
    {
      header: 'Min Purchase',
      accessor: 'min_order_amount',
      render: (row) => row.min_order_amount > 0 ? `$${parseFloat(row.min_order_amount).toFixed(2)}` : 'No Minimum'
    },
    {
      header: 'Usage Limits',
      accessor: 'usage_limit',
      render: (row) => (
        <div style={{ fontSize: '0.75rem', color: '#475569' }}>
          <div><strong>Redeemed:</strong> {row.total_used_count || 0} times</div>
          <div><strong>Limit:</strong> {row.usage_limit ? `${row.usage_limit} total` : 'Unlimited'}</div>
          <div><strong>User Max:</strong> {row.usage_per_user || 1}/user</div>
        </div>
      )
    },
    {
      header: 'Expiry Date',
      accessor: 'expires_at',
      render: (row) => {
        const exp = row.expires_at ? new Date(row.expires_at) : null;
        const isExpired = exp && exp < new Date();
        return (
          <div style={{ fontSize: '0.75rem', color: isExpired ? '#ef4444' : '#64748b' }}>
            {exp ? exp.toLocaleDateString() : 'No Expiry'}
            {isExpired && <span style={{ display: 'block', fontWeight: '700', color: '#ef4444' }}>(EXPIRED)</span>}
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (row) => (
        <span style={{
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '700',
          backgroundColor: row.is_active ? '#ecfdf5' : '#f1f5f9',
          color: row.is_active ? '#10b981' : '#64748b'
        }}>
          {row.is_active ? 'Active' : 'Disabled'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => handleOpenModal(row)} style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>
            <Edit2 size={16} color="#2563eb" />
          </button>
          <button onClick={() => handleDelete(row.id)} style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>
            <Trash2 size={16} color="#ef4444" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Coupon Code Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>Manage promotional coupon codes, usage limits, and checkout discount rules</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          style={{
            padding: '10px 18px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <Plus size={18} /> Create Coupon Code
        </button>
      </div>

      <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <DataTable
          columns={columns}
          data={coupons}
          isLoading={isLoading}
          emptyMessage="No promo coupons created yet."
        />
      </div>

      {/* Add / Edit Coupon Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon Code'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Coupon Code * (Auto Upper Case)</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. KRISHNA20"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '700', letterSpacing: '1px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Get 20% OFF on your first purchase above $50"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Discount ($)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Discount Value *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === 'flat' ? 'e.g. 10.00' : 'e.g. 20'}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Minimum Cart Subtotal ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                placeholder="0.00 (No Minimum)"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Max Discount Cap ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                placeholder="Optional max cap"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Total Global Usage Limit</label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="Optional (e.g. 100)"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Usage Limit Per User</label>
              <input
                type="number"
                value={formData.usagePerUser}
                onChange={(e) => setFormData({ ...formData, usagePerUser: parseInt(e.target.value, 10) || 1 })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Expiry Date</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="couponIsActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="couponIsActive" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>Active Status</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};

export default Coupons;
