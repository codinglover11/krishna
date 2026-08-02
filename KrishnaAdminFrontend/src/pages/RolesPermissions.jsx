import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ShieldCheck, Lock, CheckSquare, Square, Save, Plus } from 'lucide-react';

export const RolesPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [assignedPerms, setAssignedPerms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        adminService.getRoles(),
        adminService.getPermissions()
      ]);
      setRoles(rolesData || []);
      setPermissions(permsData || []);

      if (rolesData && rolesData.length > 0) {
        setSelectedRoleId(rolesData[0].id);
        setAssignedPerms(rolesData[0].permissions || []);
      }
    } catch (err) {
      toast.error('Failed to load RBAC roles & permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRoleId(role.id);
    setAssignedPerms(role.permissions || []);
  };

  const handleTogglePermission = (code) => {
    if (assignedPerms.includes(code)) {
      setAssignedPerms(assignedPerms.filter((c) => c !== code));
    } else {
      setAssignedPerms([...assignedPerms, code]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setIsSaving(true);
    try {
      await adminService.updateRolePermissions(selectedRoleId, assignedPerms);
      toast.success('Role permissions matrix saved successfully.');
      fetchData();
    } catch (err) {
      toast.error('Failed to save role permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading RBAC System Matrix..." />;
  }

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const isSuperAdmin = selectedRole?.name === 'Super Admin';

  // Group permissions by module
  const modulesMap = {};
  permissions.forEach((p) => {
    const mod = p.module || 'General';
    if (!modulesMap[mod]) modulesMap[mod] = [];
    modulesMap[mod].push(p);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px' }}>
      
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Roles & Permission Matrix</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>Configure granular administrative access controls for system roles</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        
        {/* Left: Role Selector List */}
        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>System Roles</h3>
          
          {roles.map((role) => {
            const isSelected = role.id === selectedRoleId;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                  backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                  color: isSelected ? '#2563eb' : '#475569',
                  fontWeight: isSelected ? '700' : '600',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>{role.name}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({role.permissions?.length || 0} perms)</span>
              </button>
            );
          })}
        </div>

        {/* Right: Permission Checkboxes Matrix */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#2563eb" /> {selectedRole?.name || 'Select Role'} Permissions
              </h2>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                {isSuperAdmin ? 'Super Admin possesses full un-restricted system access.' : 'Toggle granular permissions granted to this role.'}
              </span>
            </div>

            {!isSuperAdmin && (
              <button
                onClick={handleSavePermissions}
                disabled={isSaving}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Permissions'}
              </button>
            )}
          </div>

          {/* Module Checklist Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {Object.keys(modulesMap).map((moduleName) => (
              <div key={moduleName} style={{ border: '1px solid #f1f5f9', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9375rem', fontWeight: '700', color: '#1e293b', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
                  {moduleName} Module
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {modulesMap[moduleName].map((p) => {
                    const isChecked = isSuperAdmin || assignedPerms.includes(p.code);
                    return (
                      <label
                        key={p.code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px',
                          backgroundColor: '#ffffff',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          cursor: isSuperAdmin ? 'not-allowed' : 'pointer',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          disabled={isSuperAdmin}
                          checked={isChecked}
                          onChange={() => handleTogglePermission(p.code)}
                          style={{ accentColor: '#2563eb' }}
                        />
                        <div>
                          <strong style={{ display: 'block', color: '#0f172a' }}>{p.name}</strong>
                          <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>{p.code}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};

export default RolesPermissions;
