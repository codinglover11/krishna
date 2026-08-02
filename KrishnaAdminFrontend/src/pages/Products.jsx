import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import DataTable from '../components/common/DataTable';
import GlobalSearch from '../components/common/GlobalSearch';
import Modal from '../components/common/Modal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Plus, Eye, Edit2, Trash2, RotateCcw, Copy, Power, Image as ImageIcon, Filter, Star, Sparkles } from 'lucide-react';

export const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState(false);
  const [bestsellerFilter, setBestsellerFilter] = useState(false);
  const [newArrivalFilter, setNewArrivalFilter] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Preview & Delete Modals
  const [previewProduct, setPreviewProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getProducts({
        search,
        category: selectedCategory,
        status: statusFilter,
        featured: featuredFilter ? 'true' : '',
        bestSellers: bestsellerFilter ? 'true' : '',
        newArrivals: newArrivalFilter ? 'true' : '',
        includeDeleted,
        page,
        limit: pageSize
      });
      setProducts(data.products || []);
      setTotalItems(data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await adminService.getCategories();
        setCategories(cats);
      } catch (err) {}
    };
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, pageSize, search, selectedCategory, statusFilter, stockFilter, featuredFilter, bestsellerFilter, newArrivalFilter, includeDeleted]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await adminService.toggleProductStatus(id, !currentStatus);
      toast.success(`Product ${!currentStatus ? 'enabled' : 'disabled'}!`);
      fetchProducts();
    } catch (err) {
      toast.error('Could not update status.');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await adminService.duplicateProduct(id);
      toast.success('Product duplicated successfully!');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to duplicate product.');
    }
  };

  const handleSoftDelete = async () => {
    if (!deletingProductId) return;
    try {
      await adminService.deleteProduct(deletingProductId);
      toast.success('Product soft-deleted.');
      setDeletingProductId(null);
      fetchProducts();
    } catch (err) {
      toast.error('Could not delete product.');
    }
  };

  const handleRestore = async (id) => {
    try {
      await adminService.restoreProduct(id);
      toast.success('Product restored successfully!');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to restore product.');
    }
  };

  const columns = [
    {
      header: 'Image',
      accessor: 'primary_image',
      render: (row) => (
        <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {row.primary_image ? (
            <img src={row.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImageIcon size={20} color="#94a3b8" />
          )}
        </div>
      )
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9375rem' }}>{row.name}</strong>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Brand: {row.brand || 'Krishna Footwear'}</span>
        </div>
      )
    },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Category', accessor: 'category_name', render: (row) => row.category_name || 'Uncategorized' },
    {
      header: 'Price',
      accessor: 'price',
      render: (row) => `$${parseFloat(row.price).toFixed(2)}`
    },
    {
      header: 'Discount Price',
      accessor: 'discount_price',
      render: (row) => row.discount_price ? `$${parseFloat(row.discount_price).toFixed(2)}` : '-'
    },
    {
      header: 'Stock',
      accessor: 'total_stock',
      render: (row) => {
        const stock = row.total_stock ?? 0;
        let color = '#10b981';
        let label = `${stock} in stock`;
        if (stock === 0) { color = '#ef4444'; label = 'Out of stock'; }
        else if (stock <= 5) { color = '#f59e0b'; label = `${stock} Low Stock`; }

        return (
          <span style={{ fontWeight: '700', color, fontSize: '0.8125rem' }}>
            {label}
          </span>
        );
      }
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
      header: 'Created Date',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setPreviewProduct(row)}
            title="Preview Product"
            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}
          >
            <Eye size={16} />
          </button>

          {!row.is_deleted ? (
            <>
              <button
                onClick={() => navigate(`/products/edit/${row.id}`)}
                title="Edit Product"
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <Edit2 size={16} />
              </button>

              <button
                onClick={() => handleToggleStatus(row.id, row.is_active)}
                title={row.is_active ? 'Disable' : 'Enable'}
                style={{ background: 'none', border: 'none', color: row.is_active ? '#f59e0b' : '#10b981', cursor: 'pointer', padding: '4px' }}
              >
                <Power size={16} />
              </button>

              <button
                onClick={() => handleDuplicate(row.id)}
                title="Duplicate Product"
                style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', padding: '4px' }}
              >
                <Copy size={16} />
              </button>

              <button
                onClick={() => setDeletingProductId(row.id)}
                title="Soft Delete Product"
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => handleRestore(row.id)}
              title="Restore Product"
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
            Products Catalog
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Manage footwear catalog, pricing, variants, and Cloudinary media
          </p>
        </div>

        <Link
          to="/products/add"
          style={{
            padding: '10px 20px',
            backgroundColor: 'hsl(215, 80%, 20%)',
            color: '#ffffff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      {/* Filter Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <GlobalSearch
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search Name, SKU, Brand..."
          width="260px"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.875rem' }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.875rem' }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Disabled Only</option>
        </select>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input type="checkbox" checked={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.checked)} />
            Featured
          </label>
          <label style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input type="checkbox" checked={bestsellerFilter} onChange={(e) => setBestsellerFilter(e.target.checked)} />
            Best Seller
          </label>
          <label style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} />
            Show Deleted
          </label>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyMessage="No products match your search or filter criteria."
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(totalItems / pageSize),
          pageSize,
          totalItems,
          onPageChange: setPage,
          onPageSizeChange: (sz) => { setPageSize(sz); setPage(1); }
        }}
      />

      {/* Product Preview Modal */}
      {previewProduct && (
        <Modal isOpen={!!previewProduct} onClose={() => setPreviewProduct(null)} title={`Preview: ${previewProduct.name}`} maxWidth="680px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            {/* Primary Image */}
            <div style={{ width: '100%', height: '260px', backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {previewProduct.primary_image ? (
                <img src={previewProduct.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#94a3b8' }}>No Image Uploaded</span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9375rem' }}>
              <div><strong>SKU:</strong> {previewProduct.sku}</div>
              <div><strong>Brand:</strong> {previewProduct.brand}</div>
              <div><strong>Category:</strong> {previewProduct.category_name || 'N/A'}</div>
              <div><strong>Base Price:</strong> ${parseFloat(previewProduct.price).toFixed(2)}</div>
              {previewProduct.discount_price && <div><strong>Discount Price:</strong> ${parseFloat(previewProduct.discount_price).toFixed(2)}</div>}
              <div><strong>Total Stock:</strong> {previewProduct.total_stock} units</div>
            </div>

            {previewProduct.short_description && (
              <div>
                <strong>Short Description:</strong>
                <p style={{ margin: '4px 0', color: '#475569', fontSize: '0.875rem' }}>{previewProduct.short_description}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        onConfirm={handleSoftDelete}
        title="Soft Delete Product"
        message="Are you sure you want to soft delete this product? It will be hidden from the storefront catalog but can be restored at any time."
        confirmText="Soft Delete"
      />

    </div>
  );
};

export default Products;
