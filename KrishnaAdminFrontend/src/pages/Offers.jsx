import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Plus, Edit2, Trash2, Tag, Calendar, Percent, DollarSign, Store, Layers, Package } from 'lucide-react';

export const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    offerScope: 'store',
    targetProductId: '',
    targetCategoryId: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [offData, prodData, catData] = await Promise.all([
        adminService.getAdminOffers(),
        adminService.getProducts(),
        adminService.getCategories()
      ]);
      setOffers(offData || []);
      setProducts(prodData?.products || prodData || []);
      setCategories(catData || []);
    } catch (err) {
      toast.error('Failed to load offers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        title: offer.title || '',
        description: offer.description || '',
        discountType: offer.discount_type || 'percentage',
        discountValue: offer.discount_value || '',
        offerScope: offer.offer_scope || 'store',
        targetProductId: offer.target_product_id || '',
        targetCategoryId: offer.target_category_id || '',
        startDate: offer.start_date ? offer.start_date.split('T')[0] : '',
        endDate: offer.end_date ? offer.end_date.split('T')[0] : '',
        isActive: offer.is_active !== false
      });
    } else {
      setEditingOffer(null);
      setFormData({
        title: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        offerScope: 'store',
        targetProductId: '',
        targetCategoryId: '',
        startDate: '',
        endDate: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.discountValue) {
      toast.error('Please enter offer title and discount value.');
      return;
    }

    try {
      if (editingOffer) {
        await adminService.updateOffer(editingOffer.id, formData);
        toast.success('Offer updated successfully.');
      } else {
        await adminService.createOffer(formData);
        toast.success('Offer created successfully.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save offer.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promotional offer?')) return;
    try {
      await adminService.deleteOffer(id);
      toast.success('Offer deleted.');
      fetchData();
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  const columns = [
    {
      header: 'Offer Title',
      accessor: 'title',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: 'var(--ink)' }}>{row.title}</strong>
          {row.description && <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{row.description}</span>}
        </div>
      )
    },
    {
      header: 'Discount',
      accessor: 'discount_value',
      render: (row) => (
        <span style={{ fontWeight: '800', color: 'var(--bottle)', fontSize: '0.9375rem' }}>
          {row.discount_type === 'flat' ? `₹${parseFloat(row.discount_value).toFixed(2)} FLAT OFF` : `${parseFloat(row.discount_value).toFixed(0)}% OFF`}
        </span>
      )
    },
    {
      header: 'Scope Target',
      accessor: 'offer_scope',
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {row.offer_scope === 'store' && <><Store size={14} color="var(--brass)" /> Entire Store</>}
          {row.offer_scope === 'category' && <><Layers size={14} color="var(--chestnut)" /> Category: {row.category_name || 'All Categories'}</>}
          {row.offer_scope === 'product' && <><Package size={14} color="var(--bottle)" /> Product: {row.product_name || 'Selected Item'}</>}
        </span>
      )
    },
    {
      header: 'Validity Period',
      accessor: 'end_date',
      render: (row) => {
        const end = row.end_date ? new Date(row.end_date) : null;
        const isExpired = end && end < new Date();
        return (
          <div style={{ fontSize: '0.75rem', color: isExpired ? 'var(--rose)' : 'var(--ink-soft)' }}>
            {row.start_date ? new Date(row.start_date).toLocaleDateString() : 'Now'} - {end ? end.toLocaleDateString() : 'No Expiry'}
            {isExpired && <span style={{ display: 'block', fontWeight: '700', color: 'var(--rose)' }}>(EXPIRED)</span>}
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
          backgroundColor: row.is_active ? 'rgba(46, 70, 53, 0.1)' : 'var(--parchment-soft)',
          color: row.is_active ? 'var(--bottle)' : 'var(--ink-soft)'
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
          <button onClick={() => handleOpenModal(row)} style={{ padding: '6px', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--card)', cursor: 'pointer' }}>
            <Edit2 size={16} color="var(--brass)" />
          </button>
          <button onClick={() => handleDelete(row.id)} style={{ padding: '6px', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--card)', cursor: 'pointer' }}>
            <Trash2 size={16} color="var(--rose)" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--ink)', margin: 0, fontFamily: '"Rozha One", serif' }}>Offer & Discount Management</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem', margin: '4px 0 0' }}>Manage storewide, category, or product level promotional discounts</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--chestnut)',
            color: 'var(--parchment)',
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
          <Plus size={18} /> Create New Offer
        </button>
      </div>

      <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
        <DataTable
          columns={columns}
          data={offers}
          isLoading={isLoading}
          emptyMessage="No promotional offers created yet."
        />
      </div>

      {/* Add / Edit Offer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingOffer ? 'Edit Offer' : 'Create New Offer'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Offer Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Festival Season Sale"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Flat ₹20 OFF on all running shoes"
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
                <option value="percentage">Percentage Discount (%)</option>
                <option value="flat">Flat Discount (₹)</option>
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
                placeholder={formData.discountType === 'flat' ? 'e.g. 15.00' : 'e.g. 20'}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Offer Scope</label>
            <select
              value={formData.offerScope}
              onChange={(e) => setFormData({ ...formData, offerScope: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="store">Entire Store</option>
              <option value="category">Specific Category</option>
              <option value="product">Specific Product</option>
            </select>
          </div>

          {formData.offerScope === 'category' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Target Category</label>
              <select
                value={formData.targetCategoryId}
                onChange={(e) => setFormData({ ...formData, targetCategoryId: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="">Select Category...</option>
                <option value="all">ALL</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {formData.offerScope === 'product' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Target Product</label>
              <select
                value={formData.targetProductId}
                onChange={(e) => setFormData({ ...formData, targetProductId: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="">Select Product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
          )}

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
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="offerIsActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="offerIsActive" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>Active Status</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer', color: 'var(--ink)' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: 'var(--chestnut)', color: 'var(--parchment)', fontWeight: '700', cursor: 'pointer' }}>
              {editingOffer ? 'Update Offer' : 'Create Offer'}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};

export default Offers;
