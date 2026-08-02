import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import DataTable from '../components/common/DataTable';
import GlobalSearch from '../components/common/GlobalSearch';
import Modal from '../components/common/Modal';
import { FormSelect, FormTextarea } from '../components/common/FormComponents';
import { Eye, Edit3, ShoppingBag, Calendar, CheckCircle2, Clock, Truck, PackageCheck, AlertCircle, XCircle } from 'lucide-react';

const ALLOWED_STATUSES = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out For Delivery',
  'Delivered',
  'Cancelled',
  'Returned',
  'Refunded'
];

export const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Status Change Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('Pending');
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdminOrders({
        search,
        status: statusFilter,
        paymentStatus: paymentFilter,
        startDate,
        endDate,
        page,
        limit: pageSize
      });
      setOrders(data.orders || []);
      setTotalItems(data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, pageSize, search, statusFilter, paymentFilter, startDate, endDate]);

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      await adminService.updateOrderStatus(selectedOrder.id, newStatus, adminNote);
      toast.success(`Order ${selectedOrder.order_number} status updated to ${newStatus}!`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update order status.';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStatusBadge = (st) => {
    let bg = '#f1f5f9';
    let fg = '#475569';

    if (['Confirmed', 'Packed'].includes(st)) { bg = '#eff6ff'; fg = '#2563eb'; }
    else if (['Shipped', 'Out For Delivery'].includes(st)) { bg = '#fffbe finished'; bg = '#fef3c7'; fg = '#d97706'; }
    else if (st === 'Delivered') { bg = '#ecfdf5'; fg = '#10b981'; }
    else if (['Cancelled', 'Returned', 'Refunded'].includes(st)) { bg = '#fef2f2'; fg = '#ef4444'; }

    return (
      <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: bg, color: fg }}>
        {st}
      </span>
    );
  };

  const columns = [
    {
      header: 'Order Number',
      accessor: 'order_number',
      render: (row) => (
        <Link to={`/orders/${row.id}`} style={{ fontWeight: '700', color: '#2563eb', textDecoration: 'none' }}>
          {row.order_number || row.id.slice(0, 8)}
        </Link>
      )
    },
    {
      header: 'Customer Information',
      accessor: 'customer_name',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: '#0f172a' }}>{row.customer_name}</strong>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>{row.customer_email}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>📞 {row.customer_phone || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Items Qty',
      accessor: 'items_count',
      render: (row) => `${row.items_count || 1} items`
    },
    {
      header: 'Grand Total',
      accessor: 'total_price',
      render: (row) => (
        <div>
          <strong style={{ color: '#0f172a', display: 'block' }}>${parseFloat(row.total_price).toFixed(2)}</strong>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.payment_method || 'COD'}</span>
        </div>
      )
    },
    {
      header: 'Payment Status',
      accessor: 'payment_status',
      render: (row) => (
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: row.payment_status === 'Paid' ? '#ecfdf5' : '#f1f5f9',
          color: row.payment_status === 'Paid' ? '#10b981' : '#64748b'
        }}>
          {row.payment_status}
        </span>
      )
    },
    {
      header: 'Order Status',
      accessor: 'status',
      render: (row) => renderStatusBadge(row.status)
    },
    {
      header: 'Placed Date',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link
            to={`/orders/${row.id}`}
            title="View Order Details"
            style={{ color: '#2563eb', padding: '4px' }}
          >
            <Eye size={16} />
          </Link>
          <button
            onClick={() => openStatusModal(row)}
            title="Update Order Status"
            style={{ background: 'none', border: 'none', color: '#d97706', cursor: 'pointer', padding: '4px' }}
          >
            <Edit3 size={16} />
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
          Order Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
          Manage customer orders, track fulfillment status, and log order timeline entries
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <GlobalSearch
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Order #, Customer, Email, Phone..."
          width="260px"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.875rem' }}
        >
          <option value="">All Order Statuses</option>
          {ALLOWED_STATUSES.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.875rem' }}
        >
          <option value="">All Payment Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#64748b' }}>
          <span>From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
          />
          <span>To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyMessage="No customer orders found."
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(totalItems / pageSize),
          pageSize,
          totalItems,
          onPageChange: setPage,
          onPageSizeChange: (sz) => { setPageSize(sz); setPage(1); }
        }}
      />

      {/* Change Status Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Update Status: Order #${selectedOrder.order_number}`}
          footer={(
            <>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'hsl(215, 80%, 20%)', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </>
          )}
        >
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div>
              <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: '#64748b' }}>
                Updating status for order placed by <strong>{selectedOrder.customer_name}</strong> on {new Date(selectedOrder.created_at).toLocaleDateString()}.
              </p>
            </div>

            <FormSelect
              label="Fulfillment Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={ALLOWED_STATUSES.map((st) => ({ value: st, label: st }))}
            />

            <FormTextarea
              label="Admin Status Note / Reason"
              placeholder="e.g. Package handed over to courier service. Tracking ID: TRK89201"
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
          </form>
        </Modal>
      )}

    </div>
  );
};

export default Orders;
