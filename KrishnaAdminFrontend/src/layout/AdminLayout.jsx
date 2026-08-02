import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../components/layout/Breadcrumb';
import Toast from '../components/common/Toast';
import ErrorBoundary from '../components/common/ErrorBoundary';

export const AdminLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'hsl(220, 15%, 95%)' }}>
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar />

        <main style={{ flex: 1, padding: '32px', textAlign: 'left', minWidth: 0 }}>
          <ErrorBoundary>
            <Breadcrumb />
            {children}
          </ErrorBoundary>
        </main>
      </div>

      <Toast />
    </div>
  );
};

export default AdminLayout;
