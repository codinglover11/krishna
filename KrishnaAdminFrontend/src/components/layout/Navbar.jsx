import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Search, ShieldCheck, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { NotificationCenter } from '../common/NotificationCenter';

export const Navbar = ({ toggleSidebar, isMobile }) => {
  const navigate = useNavigate();
  const { adminUser, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--card)',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 16px' : '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        {isMobile && (
          <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <Menu size={24} color="#334155" />
          </button>
        )}
        
        {/* Global Search Input */}
        <div style={{ position: 'relative', width: isMobile ? '100%' : '300px', maxWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder={isMobile ? "Search..." : "Search products, orders, categories..."}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 38px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              backgroundColor: 'var(--parchment)',
              color: 'var(--ink)',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Notification Center */}
        <NotificationCenter />

        {/* User Profile Badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: 0
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--brass)',
              color: 'var(--card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.9375rem'
            }}>
              {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: 'var(--ink)' }}>
                {adminUser?.name || 'Administrator'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--brass-dark)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> {adminUser?.role || 'ADMIN'}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '200px',
              backgroundColor: 'var(--card)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow)',
              border: '1px solid var(--line)',
              padding: '8px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/profile');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--ink)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <User size={16} /> Profile Info
              </button>
              <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '4px 0' }} />
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
