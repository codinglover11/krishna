import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { FormInput, FormTextarea, FormCheckbox } from '../components/common/FormComponents';
import { ImageUploader } from '../components/common/ImageUploader';
import { Edit2, FolderTree } from 'lucide-react';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    displayOrder: 0,
    isActive: true
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getCategories({ includeDeleted: false });
      setCategories(data.filter(c => ['men', 'women', 'kids', 'jutti'].includes(c.slug?.toLowerCase())));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      imageUrl: cat.image_url || '',
      displayOrder: cat.display_order || 0,
      isActive: cat.is_active !== false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData);
        toast.success('Category updated successfully!');
      } else {
        await adminService.createCategory(formData);
        toast.success('Category created successfully!');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save category.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Image',
      accessor: 'image_url',
      render: (row) => (
        <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'var(--parchment-soft)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
          {row.image_url ? (
            <img src={row.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <FolderTree size={20} color="var(--ink-soft)" />
          )}
        </div>
      )
    },
    {
      header: 'Category Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: 'var(--ink)' }}>{row.name}</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>/{row.slug}</span>
        </div>
      )
    },
    {
      header: 'Products Count',
      accessor: 'product_count',
      render: (row) => (
        <span style={{ fontWeight: '700', color: 'var(--brass)' }}>{row.product_count || 0} products</span>
      )
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (row) => {
        return (
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
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => openEditModal(row)}
            title="Edit Category"
            style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer', padding: '4px' }}
          >
            <Edit2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--ink)', margin: '0 0 4px', fontFamily: '"Rozha One", serif' }}>
            Category Management
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem', margin: 0 }}>
            Manage banners and descriptions for the fixed shop categories.
          </p>
        </div>
        <div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', slug: '', description: '', imageUrl: '', displayOrder: 0, isActive: true });
              setModalOpen(true);
            }}
            style={{ padding: '10px 20px', backgroundColor: 'var(--chestnut)', color: 'var(--parchment)', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
          >
            Add New Category
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyMessage="No categories created yet."
      />

      {/* Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Category Settings"
        footer={(
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--line)', backgroundColor: 'var(--card)', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--chestnut)', color: 'var(--parchment)', fontWeight: '700', cursor: 'pointer' }}
            >
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </>
        )}
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>

          <div style={{ padding: '12px', backgroundColor: 'var(--parchment-soft)', borderRadius: '8px', border: '1px solid var(--line)', marginBottom: '8px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.875rem', color: 'var(--ink-soft)' }}>Category Name</p>
            {editingCategory ? (
              <p style={{ margin: 0, fontWeight: '600', color: 'var(--ink)' }}>{formData.name}</p>
            ) : (
              <FormInput
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                placeholder="e.g. Men"
              />
            )}
          </div>

          <FormTextarea
            label="Description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Cloudinary Image Input */}
          <ImageUploader
            images={formData.imageUrl}
            folder="categories"
            label="Category Banner Image"
            onChange={(res) => setFormData({ ...formData, imageUrl: res ? res.url : '' })}
          />

          <FormCheckbox
            id="catIsActive"
            label="Active Category (Visible on storefront)"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
        </form>
      </Modal>

    </div>
  );
};

export default Categories;
