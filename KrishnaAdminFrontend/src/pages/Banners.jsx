import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { ImageUploader } from '../components/common/ImageUploader';
import { Plus, Edit2, Trash2, RotateCcw, Eye, Image as ImageIcon, Link as LinkIcon, Calendar } from 'lucide-react';

export const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    displayOrder: 0,
    startDate: '',
    endDate: '',
    isActive: true
  });

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdminBanners();
      setBanners(data || []);
    } catch (err) {
      toast.error('Failed to load banners.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        imageUrl: banner.image_url || '',
        linkUrl: banner.link_url || '',
        displayOrder: banner.display_order || 0,
        startDate: banner.start_date ? banner.start_date.split('T')[0] : '',
        endDate: banner.end_date ? banner.end_date.split('T')[0] : '',
        isActive: banner.is_active !== false
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        displayOrder: 0,
        startDate: '',
        endDate: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploaded = await adminService.uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: uploaded.url }));
      toast.success('Banner image uploaded to Cloudinary.');
    } catch (err) {
      toast.error('Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast.error('Please enter a title and upload a banner image.');
      return;
    }

    try {
      if (editingBanner) {
        await adminService.updateBanner(editingBanner.id, formData);
        toast.success('Banner updated successfully.');
      } else {
        await adminService.createBanner(formData);
        toast.success('Banner created successfully.');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error('Failed to save banner.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Soft delete this banner?')) return;
    try {
      await adminService.deleteBanner(id);
      toast.success('Banner soft-deleted.');
      fetchBanners();
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  const handleRestore = async (id) => {
    try {
      await adminService.restoreBanner(id);
      toast.success('Banner restored.');
      fetchBanners();
    } catch (err) {
      toast.error('Restore failed.');
    }
  };

  const columns = [
    {
      header: 'Banner Image',
      accessor: 'image_url',
      render: (row) => (
        <div style={{ width: '120px', height: '50px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}>
          {row.image_url ? (
            <img src={row.image_url} alt={row.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
              <ImageIcon size={20} />
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Banner Info',
      accessor: 'title',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: '#0f172a' }}>{row.title}</strong>
          {row.subtitle && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.subtitle}</span>}
        </div>
      )
    },
    {
      header: 'Order',
      accessor: 'display_order',
      render: (row) => <span style={{ fontWeight: '700', color: '#2563eb' }}>#{row.display_order || 0}</span>
    },
    {
      header: 'Link URL',
      accessor: 'link_url',
      render: (row) => row.link_url ? (
        <span style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <LinkIcon size={14} /> {row.link_url}
        </span>
      ) : '-'
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
          backgroundColor: row.is_deleted ? '#fef2f2' : row.is_active ? '#ecfdf5' : '#f1f5f9',
          color: row.is_deleted ? '#ef4444' : row.is_active ? '#10b981' : '#64748b'
        }}>
          {row.is_deleted ? 'Soft Deleted' : row.is_active ? 'Active' : 'Disabled'}
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

          {row.is_deleted ? (
            <button onClick={() => handleRestore(row.id)} style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer' }} title="Restore">
              <RotateCcw size={16} color="#10b981" />
            </button>
          ) : (
            <button onClick={() => handleDelete(row.id)} style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer' }} title="Delete">
              <Trash2 size={16} color="#ef4444" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Banner Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>Manage hero slider promotional banners for customer website</p>
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
          <Plus size={18} /> Add New Banner
        </button>
      </div>

      <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <DataTable
          columns={columns}
          data={banners}
          isLoading={isLoading}
          emptyMessage="No promotional banners created yet."
        />
      </div>

      {/* Add / Edit Banner Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBanner ? 'Edit Banner' : 'Add New Banner'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Banner Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Summer Footwear Festival"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Up to 40% OFF Premium Leather Shoes"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <ImageUploader
            images={formData.imageUrl}
            folder="banners"
            label="Banner Image"
            onChange={(res) => setFormData({ ...formData, imageUrl: res ? res.url : '' })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Redirect URL</label>
              <input
                type="text"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="e.g. /products?category=1"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Display Order Index</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
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
              id="bannerIsActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="bannerIsActive" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>Active Status</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
              {editingBanner ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};

export default Banners;
