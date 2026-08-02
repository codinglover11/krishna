import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from './LoadingSpinner';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, adminUser, isLoading, verifyAdmin } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && !adminUser) {
      verifyAdmin();
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Verifying Admin Access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // RBAC check: role must be ADMIN (case-insensitive)
  if (adminUser && adminUser.role && adminUser.role.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
