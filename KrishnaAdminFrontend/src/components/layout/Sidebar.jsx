import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Ticket,
  Image,
  Star,
  BarChart3,
  Settings,
  LogOut,
  ShieldAlert,
  Shield,
  X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Products', path: '/products', icon: <ShoppingBag size={18} /> },
    { label: 'Categories', path: '/categories', icon: <FolderTree size={18} /> },
    { label: 'Inventory', path: '/inventory', icon: <Package size={18} /> },
    { label: 'Orders', path: '/orders', icon: <ShoppingCart size={18} /> },
    { label: 'Customers', path: '/customers', icon: <Users size={18} /> },
    { label: 'Offers', path: '/offers', icon: <Tag size={18} /> },
    { label: 'Coupons', path: '/coupons', icon: <Ticket size={18} /> },
    { label: 'Banners', path: '/banners', icon: <Image size={18} /> },
    { label: 'Reviews', path: '/reviews', icon: <Star size={18} /> },
    { label: 'Admin Users', path: '/users', icon: <Users size={18} /> },
    { label: 'Roles & Perms', path: '/roles', icon: <ShieldAlert size={18} /> },
    { label: 'Audit Logs', path: '/audit-logs', icon: <Shield size={18} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--ink)',
      color: 'var(--parchment)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: isMobile ? (isOpen ? '0' : '-260px') : '0',
      transition: 'left 0.3s ease',
      top: 0,
      zIndex: 100,
      boxShadow: '4px 0 10px rgba(0,0,0,0.2)'
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--brass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--card)',
            fontWeight: '700',
            fontSize: '1.125rem',
            fontFamily: '"Rozha One", serif'
          }}>
            KF
          </div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '400', margin: 0, color: 'var(--parchment)', fontFamily: '"Rozha One", serif', letterSpacing: '0.02em' }}>
              Krishna Admin
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'rgba(243,236,220,0.6)' }}>Footwear Management</span>
          </div>
        </div>
        {isMobile && (
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={24} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: isActive ? 'var(--card)' : 'rgba(243, 236, 220, 0.75)',
              backgroundColor: isActive ? 'var(--chestnut)' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              fontSize: '0.9375rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer / Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'var(--rose)',
            backgroundColor: 'rgba(185, 122, 102, 0.1)',
            border: 'none',
            fontSize: '0.9375rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
