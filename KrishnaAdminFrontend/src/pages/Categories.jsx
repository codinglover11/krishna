import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { FormInput, FormTextarea, FormCheckbox } from '../components/common/FormComponents';
import { ImageUploader } from '../components/common/ImageUploader';
import { Plus, Edit2, Trash2, RotateCcw, Upload, FolderTree, Image as ImageIcon } from 'lucide-react';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Delete modal state
  const [deletingId, setDeletingId] = useState(null);

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
      const data = await adminService.getCategories({ includeDeleted });
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [includeDeleted]);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      displayOrder: categories.length + 1,
      isActive: true
    });
    setModalOpen(true);
  };

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

  const handleNameChange = (val) => {
    const slugVal = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({ ...prev, name: val, slug: prev.slug || slugVal }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await adminService.uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: res.url }));
      toast.success('Category image uploaded to Cloudinary!');
    } catch (err) {
      toast.error('Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warning('Category name is required.');
      return;
    }

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

  const handleSoftDelete = async () => {
    if (!deletingId) return;
    try {
      await adminService.deleteCategory(deletingId);
      toast.success('Category soft-deleted.');
      setDeletingId(null);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category.');
    }
  };

  const handleRestore = async (id) => {
    try {
      await adminService.restoreCategory(id);
      toast.success('Category restored successfully!');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to restore category.');
    }
  };

  const columns = [
    {
      header: 'Image',
      accessor: 'image_url',
      render: (row) => (
        <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {row.image_url ? (
            <img src={row.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <FolderTree size={20} color="#94a3b8" />
          )}
        </div>
      )
    },
    {
      header: 'Category Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: '#0f172a' }}>{row.name}</strong>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/{row.slug}</span>
        </div>
      )
    },
    { header: 'Display Order', accessor: 'display_order' },
    {
      header: 'Products Count',
      accessor: 'product_count',
      render: (row) => (
        <span style={{ fontWeight: '700', color: '#2563eb' }}>{row.product_count || 0} products</span>
      )
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (row) => {
        if (row.is_deleted) {
          return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#fef2f2', color: '#ef4444' }}>Deleted</span>;
        }
        return (
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
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!row.is_deleted ? (
            <>
              <button
                onClick={() => openEditModal(row)}
                title="Edit Category"
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => setDeletingId(row.id)}
                title="Soft Delete Category"
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => handleRestore(row.id)}
              title="Restore Category"
              style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }}
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
            Category Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Organize catalog categories, display order, and banner images
          </p>
        </div>

        <button
          onClick={openAddModal}
          style={{
            padding: '10px 20px',
            backgroundColor: 'hsl(215, 80%, 20%)',
            color: '#ffffff',
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
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '12px 20px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}>
        <label style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} />
          Show Soft-Deleted Categories
        </label>
      </div>

      {/* Categories Table */}
      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyMessage="No categories created yet."
      />

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        footer={(
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'hsl(215, 80%, 20%)', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
            >
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </>
        )}
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <FormInput
            label="Category Name"
            required
            placeholder="e.g. Formal Shoes"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />

          <FormInput
            label="Slug"
            placeholder="formal-shoes"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />


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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleSoftDelete}
        title="Soft Delete Category"
        message="Are you sure you want to soft delete this category? Products associated with it will remain intact."
        confirmText="Soft Delete"
      />

    </div>
  );
};

export default Categories;
