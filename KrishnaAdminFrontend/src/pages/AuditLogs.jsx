import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Shield, Eye, Search, Filter, Calendar, User, Terminal } from 'lucide-react';

export const AuditLogs = () => {
  const [auditData, setAuditData] = useState({ logs: [], pagination: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchLogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await adminService.getAuditLogs({
        page,
        limit: 15,
        search,
        module: moduleFilter,
        startDate,
        endDate
      });
      setAuditData(data || { logs: [], pagination: {} });
    } catch (err) {
      toast.error('Failed to load audit log trail.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [moduleFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'created_at',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '0.8125rem' }}>
            {new Date(row.created_at).toLocaleDateString()}
          </strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
            {new Date(row.created_at).toLocaleTimeString()}
          </span>
        </div>
      )
    },
    {
      header: 'Admin User',
      accessor: 'admin_name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} color="var(--brass)" />
          <strong style={{ fontSize: '0.8125rem', color: 'var(--ink)' }}>{row.admin_name}</strong>
        </div>
      )
    },
    {
      header: 'Module',
      accessor: 'module',
      render: (row) => (
        <span style={{
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '700',
          backgroundColor: 'var(--parchment-soft)',
          color: 'var(--brass)',
          border: '1px solid var(--brass)'
        }}>
          {row.module}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        <code style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink-soft)', backgroundColor: 'var(--parchment-soft)', padding: '2px 6px', borderRadius: '4px' }}>
          {row.action}
        </code>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--ink-soft)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '320px' }}>
          {row.description}
        </span>
      )
    },
    {
      header: 'IP Address',
      accessor: 'ip_address',
      render: (row) => (
        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--ink-soft)' }}>
          {row.ip_address || '127.0.0.1'}
        </span>
      )
    },
    {
      header: 'Details',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => handleViewDetail(row)}
          style={{ padding: '6px', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--card)', cursor: 'pointer' }}
          title="View Audit Detail"
        >
          <Eye size={16} color="var(--brass)" />
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--ink)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontFamily: '"Rozha One", serif' }}>
            <Shield size={26} color="var(--chestnut)" /> Admin Audit Logs
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem', margin: '4px 0 0' }}>Immutable security audit trail of administrative system activities and data mutations</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{ padding: '16px 20px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex', gap: '8px', minWidth: '260px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} color="var(--ink-soft)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by admin name, action code, or description..."
              style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.875rem' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 16px', backgroundColor: 'var(--bottle)', color: 'var(--parchment)', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.875rem' }}
          >
            <option value="">All Modules</option>
            <option value="Products">Products</option>
            <option value="Orders">Orders</option>
            <option value="Customers">Customers</option>
            <option value="Marketing">Marketing</option>
            <option value="Reviews">Reviews</option>
            <option value="Settings">Settings</option>
            <option value="Users">Users</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '9px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.8125rem' }}
            title="Start Date"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '9px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.8125rem' }}
            title="End Date"
          />
        </div>
      </div>

      {/* Audit Logs Data Table */}
      <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
        <DataTable
          columns={columns}
          data={auditData.logs || []}
          isLoading={isLoading}
          emptyMessage="No audit log entries recorded."
        />
      </div>

      {/* Audit Log Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Audit Trail Entry Detail">
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--parchment-soft)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong style={{ color: 'var(--ink)' }}>Log Record ID:</strong> #{selectedLog.id}</div>
              <div><strong style={{ color: 'var(--ink)' }}>Timestamp:</strong> {new Date(selectedLog.created_at).toLocaleString()}</div>
              <div><strong style={{ color: 'var(--ink)' }}>Admin User:</strong> {selectedLog.admin_name}</div>
              <div><strong style={{ color: 'var(--ink)' }}>System Module:</strong> {selectedLog.module}</div>
              <div><strong style={{ color: 'var(--ink)' }}>Action Code:</strong> <code>{selectedLog.action}</code></div>
              <div><strong style={{ color: 'var(--ink)' }}>Client IP Address:</strong> {selectedLog.ip_address}</div>
            </div>

            <div>
              <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--ink)', marginBottom: '6px' }}>Activity Description:</strong>
              <div style={{ padding: '12px', backgroundColor: 'var(--ink)', color: 'var(--parchment)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {selectedLog.description}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default AuditLogs;
