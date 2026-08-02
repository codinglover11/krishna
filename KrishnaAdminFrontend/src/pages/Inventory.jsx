import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import DataTable from '../components/common/DataTable';
import GlobalSearch from '../components/common/GlobalSearch';
import { Package, AlertTriangle, XCircle, CheckCircle2, Save, RefreshCw } from 'lucide-react';

export const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({ out_of_stock_count: 0, low_stock_count: 0, in_stock_count: 0, total_items_count: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState(''); // '', 'low', 'out', 'in'

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalItems, setTotalItems] = useState(0);

  // Quick edit stock state: { [variantId]: number }
  const [editQuantities, setEditQuantities] = useState({});
  const [savingVariantId, setSavingVariantId] = useState(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getInventory({
        search,
        stockFilter,
        page,
        limit: pageSize
      });
      setInventory(data.items || []);
      setSummary(data.summary || {});
      setTotalItems(data.pagination?.total || 0);

      // Pre-fill local quick edit quantities
      const qMap = {};
      (data.items || []).forEach((item) => {
        qMap[item.variant_id] = item.stock_quantity;
      });
      setEditQuantities(qMap);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, pageSize, search, stockFilter]);

  const handleQuantityChange = (variantId, val) => {
    setEditQuantities((prev) => ({
      ...prev,
      [variantId]: Math.max(0, parseInt(val, 10) || 0)
    }));
  };

  const handleSaveStock = async (variantId) => {
    const newQty = editQuantities[variantId];
    if (newQty === undefined) return;

    setSavingVariantId(variantId);
    try {
      await adminService.updateVariantStock(variantId, newQty);
      toast.success('Stock quantity updated!');
      fetchInventory();
    } catch (err) {
      toast.error('Failed to update stock quantity.');
    } finally {
      setSavingVariantId(null);
    }
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'product_name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
            {row.primary_image ? (
              <img src={row.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Package size={20} color="#94a3b8" />
            )}
          </div>
          <div>
            <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.875rem' }}>{row.product_name}</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {row.sku}</span>
          </div>
        </div>
      )
    },
    { header: 'Category', accessor: 'category_name', render: (row) => row.category_name || 'N/A' },
    {
      header: 'Variant (Size/Color)',
      accessor: 'size_label',
      render: (row) => (
        <span style={{ fontWeight: '600', color: '#334155' }}>
          {row.size_label || 'Default Size'} | {row.color_name || 'Standard'}
        </span>
      )
    },
    {
      header: 'Current Stock Qty',
      accessor: 'stock_quantity',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            min="0"
            value={editQuantities[row.variant_id] ?? row.stock_quantity}
            onChange={(e) => handleQuantityChange(row.variant_id, e.target.value)}
            style={{
              width: '70px',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontWeight: '700',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}
          />
          {editQuantities[row.variant_id] !== row.stock_quantity && (
            <button
              onClick={() => handleSaveStock(row.variant_id)}
              disabled={savingVariantId === row.variant_id}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Save size={14} /> Save
            </button>
          )}
        </div>
      )
    },
    {
      header: 'Stock Status',
      accessor: 'status',
      render: (row) => {
        const qty = row.stock_quantity;
        if (qty === 0) {
          return <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#fef2f2', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Out of Stock</span>;
        }
        if (qty <= 5) {
          return <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#fffbe finished', color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> Low Stock</span>;
        }
        return <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#ecfdf5', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> In Stock</span>;
      }
    },
    {
      header: 'Last Updated',
      accessor: 'updated_at',
      render: (row) => new Date(row.updated_at).toLocaleDateString()
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
          Inventory Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
          Monitor stock availability, low-stock warnings, and update inventory counts
        </p>
      </div>

      {/* Summary Indicator Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>Total Inventory Stock</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '8px 0 0' }}>{summary.total_items_count} units</h2>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#10b981' }}>In Stock</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981', margin: '8px 0 0' }}>{summary.in_stock_count} variants</h2>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#d97706' }}>Low Stock Warning (≤5)</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#d97706', margin: '8px 0 0' }}>{summary.low_stock_count} variants</h2>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#ef4444' }}>Out of Stock</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ef4444', margin: '8px 0 0' }}>{summary.out_of_stock_count} variants</h2>
        </div>
      </div>

      {/* Controls Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <GlobalSearch
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search Product, SKU, Size..."
          width="280px"
        />

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.875rem' }}
        >
          <option value="">All Inventory Statuses</option>
          <option value="low">Low Stock Warning (1-5)</option>
          <option value="out">Out of Stock (0)</option>
          <option value="in">In Stock (&gt;5)</option>
        </select>

        <button
          onClick={fetchInventory}
          style={{
            marginLeft: 'auto',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#334155',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={inventory}
        isLoading={isLoading}
        emptyMessage="No variant inventory items found."
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(totalItems / pageSize),
          pageSize,
          totalItems,
          onPageChange: setPage,
          onPageSizeChange: (sz) => { setPageSize(sz); setPage(1); }
        }}
      />

    </div>
  );
};

export default Inventory;
