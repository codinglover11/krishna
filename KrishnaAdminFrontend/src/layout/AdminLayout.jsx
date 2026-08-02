import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../components/layout/Breadcrumb';
import Toast from '../components/common/Toast';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useState, useEffect } from 'react';

export const AdminLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'hsl(220, 15%, 95%)' }}>
      {/* Fixed Sidebar */}
      <Sidebar isOpen={isMobileOpen} isMobile={isMobile} onClose={() => setIsMobileOpen(false)} />

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: isMobile ? '0' : '260px', display: 'flex', flexDirection: 'column', minWidth: 0, transition: 'margin 0.3s ease' }}>
        <Navbar toggleSidebar={() => setIsMobileOpen(!isMobileOpen)} isMobile={isMobile} />

        <main style={{ flex: 1, padding: isMobile ? '16px' : '32px', textAlign: 'left', minWidth: 0 }}>
          <ErrorBoundary>
            <Breadcrumb />
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {isMobileOpen && isMobile && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 }}
        />
      )}

      <Toast />
    </div>
  );
};

export default AdminLayout;
