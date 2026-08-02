import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import DataTable from '../components/common/DataTable';
import GlobalSearch from '../components/common/GlobalSearch';
import { Users, Eye, Power, ShoppingBag, DollarSign, Calendar, ShieldCheck } from 'lucide-react';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdminCustomers({
        search,
        isActive: isActiveFilter,
        page,
        limit: pageSize
      });
      setCustomers(data.customers || []);
      setTotalItems(data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, pageSize, search, isActiveFilter]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await adminService.toggleCustomerStatus(id, !currentStatus);
      toast.success(`Customer account ${!currentStatus ? 'activated' : 'deactivated'}!`);
      fetchCustomers();
    } catch (err) {
      toast.error('Could not update customer status.');
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: 'name',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: '#0f172a' }}>{row.name}</strong>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.email}</span>
        </div>
      )
    },
    {
      header: 'Mobile / Phone',
      accessor: 'mobile',
      render: (row) => row.mobile || 'Not provided'
    },
    {
      header: 'Total Orders',
      accessor: 'total_orders',
      render: (row) => (
        <span style={{ fontWeight: '700', color: '#2563eb' }}>
          {row.total_orders || 0} orders
        </span>
      )
    },
    {
      header: 'Total Spent',
      accessor: 'total_spent',
      render: (row) => (
        <span style={{ fontWeight: '700', color: '#10b981' }}>
          ${parseFloat(row.total_spent || 0).toFixed(2)}
        </span>
      )
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
          backgroundColor: row.is_active ? '#ecfdf5' : '#fef2f2',
          color: row.is_active ? '#10b981' : '#ef4444'
        }}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Registered Date',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link
            to={`/customers/${row.id}`}
            title="View Customer Profile & History"
            style={{ color: '#2563eb', padding: '4px' }}
          >
            <Eye size={16} />
          </Link>
          <button
            onClick={() => handleToggleStatus(row.id, row.is_active)}
            title={row.is_active ? 'Deactivate Account' : 'Activate Account'}
            style={{ background: 'none', border: 'none', color: row.is_active ? '#ef4444' : '#10b981', cursor: 'pointer', padding: '4px' }}
          >
            <Power size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
          Customer Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
          Monitor customer accounts, spending statistics, shipping address books, and active status
        </p>
      </div>

      {/* Filter Bar */}
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
          placeholder="Search Customer Name, Email, Mobile..."
          width="280px"
        />

        <select
          value={isActiveFilter}
          onChange={(e) => setIsActiveFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.875rem' }}
        >
          <option value="">All Customer Statuses</option>
          <option value="true">Active Accounts Only</option>
          <option value="false">Inactive / Suspended Only</option>
        </select>
      </div>

      {/* Customers Table */}
      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        emptyMessage="No registered customers found."
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

export default Customers;
