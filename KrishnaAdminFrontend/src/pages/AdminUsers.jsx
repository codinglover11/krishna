import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { UserPlus, Shield, Power, Key, Mail, User } from 'lucide-react';

export const AdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleId: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        adminService.getAdminUserAccounts(),
        adminService.getRoles()
      ]);
      setAdminUsers(usersData || []);
      setRoles(rolesData || []);
    } catch (err) {
      toast.error('Failed to load admin user accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      roleId: roles.length > 0 ? roles[0].id : ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.roleId) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      await adminService.createAdminUserAccount(formData);
      toast.success('Admin user account created successfully.');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin user.');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminService.toggleAdminUserStatus(user.id, !user.is_active);
      toast.success(`User ${user.name} status updated to ${!user.is_active ? 'Active' : 'Inactive'}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const columns = [
    {
      header: 'Admin Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: '#0f172a' }}>{row.name}</strong>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.email}</span>
        </div>
      )
    },
    {
      header: 'System Role',
      accessor: 'role_name',
      render: (row) => (
        <span style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.8125rem',
          fontWeight: '700',
          backgroundColor: row.role_name === 'Super Admin' ? '#eff6ff' : '#f8fafc',
          color: row.role_name === 'Super Admin' ? '#2563eb' : '#475569',
          border: '1px solid #cbd5e1'
        }}>
          <Shield size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {row.role_name}
        </span>
      )
    },
    {
      header: 'Account Status',
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
          {row.is_active ? 'Active' : 'Deactivated'}
        </span>
      )
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
        <button
          onClick={() => handleToggleStatus(row)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: row.is_active ? '#fef2f2' : '#ecfdf5',
            color: row.is_active ? '#ef4444' : '#10b981',
            fontWeight: '700',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Power size={14} /> {row.is_active ? 'Deactivate' : 'Activate'}
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Admin User Accounts</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>Manage administrative team accounts and role assignments</p>
        </div>

        <button
          onClick={handleOpenModal}
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
          <UserPlus size={18} /> Create Admin User
        </button>
      </div>

      <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <DataTable
          columns={columns}
          data={adminUsers}
          isLoading={isLoading}
          emptyMessage="No admin user accounts found."
        />
      </div>

      {/* Create Admin User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Admin User">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. rahul@krishnafootwear.com"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Account Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>System Role *</label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
              Create Account
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};

export default AdminUsers;
