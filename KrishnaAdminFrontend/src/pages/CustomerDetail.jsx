import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import DataTable from '../components/common/DataTable';
import { ArrowLeft, User, Mail, Calendar, MapPin, ShoppingBag, DollarSign, Clock, ShieldCheck, Power } from 'lucide-react';

export const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomerData = async () => {
    setIsLoading(true);
    try {
      const custData = await adminService.getAdminCustomerById(id);
      setCustomer(custData);

      const custOrders = await adminService.getAdminCustomerOrders(id);
      setOrders(custOrders || []);
    } catch (err) {
      toast.error('Failed to load customer profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!customer) return;
    try {
      await adminService.toggleCustomerStatus(customer.id, !customer.is_active);
      toast.success(`Customer status updated to ${!customer.is_active ? 'Active' : 'Inactive'}`);
      fetchCustomerData();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading Customer Profile..." />;
  }

  if (!customer) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Customer Not Found</h2>
        <Link to="/customers">Back to Customers</Link>
      </div>
    );
  }

  const addresses = customer.addresses || [];

  const orderColumns = [
    {
      header: 'Order Number',
      accessor: 'order_number',
      render: (row) => (
        <Link to={`/orders/${row.id}`} style={{ fontWeight: '700', color: 'var(--brass)', textDecoration: 'none' }}>
          {row.order_number || row.id.slice(0, 8)}
        </Link>
      )
    },
    {
      header: 'Placed Date',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleDateString()
    },
    {
      header: 'Items Count',
      accessor: 'items_count',
      render: (row) => `${row.items_count || 1} items`
    },
    {
      header: 'Total Price',
      accessor: 'total_price',
      render: (row) => (
        <strong style={{ color: 'var(--ink)' }}>₹{parseFloat(row.total_price).toFixed(2)}</strong>
      )
    },
    {
      header: 'Payment Method',
      accessor: 'payment_method',
      render: (row) => row.payment_method || 'COD'
    },
    {
      header: 'Order Status',
      accessor: 'status',
      render: (row) => (
        <span style={{
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '700',
          backgroundColor: row.status === 'Delivered' ? 'rgba(46, 70, 53, 0.1)' : 'var(--parchment-soft)',
          color: row.status === 'Delivered' ? 'var(--bottle)' : 'var(--ink-soft)'
        }}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <Link to={`/orders/${row.id}`} style={{ fontSize: '0.8125rem', color: 'var(--brass)', fontWeight: '600', textDecoration: 'none' }}>
          View Details →
        </Link>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/customers" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-soft)', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Back to Customers
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--ink)', margin: 0, fontFamily: '"Rozha One", serif' }}>
            {customer.name}
          </h1>
        </div>

        <button
          onClick={handleToggleStatus}
          style={{
            padding: '10px 20px',
            backgroundColor: customer.is_active ? 'var(--rose)' : 'var(--bottle)',
            color: 'var(--parchment)',
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
          <Power size={16} /> {customer.is_active ? 'Deactivate Account' : 'Activate Account'}
        </button>
      </div>

      {/* Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '20px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--ink-soft)' }}>Total Orders Placed</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--brass)', margin: '6px 0 0' }}>{customer.total_orders || 0}</h2>
        </div>

        <div style={{ padding: '20px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--ink-soft)' }}>Lifetime Spent</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--bottle)', margin: '4px 0 0' }}>₹{parseFloat(customer.total_spent || 0).toFixed(2)}</h2>
        </div>

        <div style={{ padding: '20px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--ink-soft)' }}>Average Order Value</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--chestnut)', margin: '6px 0 0' }}>₹{parseFloat(customer.avg_order_value || 0).toFixed(2)}</h2>
        </div>

        <div style={{ padding: '20px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--ink-soft)' }}>Last Active Order Date</span>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', margin: '10px 0 0' }}>
            {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'No Orders Yet'}
          </h2>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Left Column: Customer Profile & Addresses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Contact Profile Card */}
          <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="var(--brass)" /> Customer Information
            </h3>
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--ink-soft)' }}>
              <div><strong style={{ color: 'var(--ink)' }}>Full Name:</strong> {customer.name}</div>
              <div><strong style={{ color: 'var(--ink)' }}>Email Address:</strong> {customer.email}</div>
              <div>
                <strong style={{ color: 'var(--ink)' }}>Account Status:</strong>{' '}
                <span style={{ fontWeight: '700', color: customer.is_active ? 'var(--bottle)' : 'var(--rose)' }}>
                  {customer.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div><strong style={{ color: 'var(--ink)' }}>Registration Date:</strong> {new Date(customer.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Saved Addresses Card */}
          <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--bottle)" /> Address Book ({addresses.length})
            </h3>

            {addresses.length === 0 ? (
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem', margin: 0 }}>No saved addresses found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {addresses.map((addr, idx) => (
                  <div key={idx} style={{ padding: '12px', backgroundColor: 'var(--parchment-soft)', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.8125rem', lineHeight: '1.5', color: 'var(--ink-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--ink)' }}>{addr.full_name} ({addr.address_type || 'Home'})</strong>
                      {addr.is_default && <span style={{ fontSize: '0.6875rem', backgroundColor: 'var(--chestnut)', color: 'var(--parchment)', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>Default</span>}
                    </div>
                    {addr.address_line1}<br />
                    {addr.address_line2 && <>{addr.address_line2}<br /></>}
                    {addr.city}, {addr.state} - {addr.postal_code}<br />
                    📞 Phone: {addr.phone_number}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Customer Order History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} color="var(--chestnut)" /> Order History ({orders.length})
            </h3>

            <DataTable
              columns={orderColumns}
              data={orders}
              isLoading={false}
              emptyMessage="This customer has not placed any orders yet."
            />
          </div>
        </div>

      </div>

    </div>
  );
};

export default CustomerDetail;
