import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminLayout from '../layout/AdminLayout';

import Login from '../pages/Login';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import AddProduct from '../pages/AddProduct';
import EditProduct from '../pages/EditProduct';
import Categories from '../pages/Categories';
import Inventory from '../pages/Inventory';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';
import Customers from '../pages/Customers';
import CustomerDetail from '../pages/CustomerDetail';
import Banners from '../pages/Banners';
import Offers from '../pages/Offers';
import Coupons from '../pages/Coupons';
import Reviews from '../pages/Reviews';
import AdminUsers from '../pages/AdminUsers';
import RolesPermissions from '../pages/RolesPermissions';
import Settings from '../pages/Settings';
import AuditLogs from '../pages/AuditLogs';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Products />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/add"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AddProduct />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/edit/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <EditProduct />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Categories />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Inventory />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Orders />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <OrderDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Customers />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CustomerDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/banners"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Banners />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/offers"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Offers />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coupons"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Coupons />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Reviews />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <RolesPermissions />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Settings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AuditLogs />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
