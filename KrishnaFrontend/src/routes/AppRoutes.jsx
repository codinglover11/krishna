import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Public Pages (Lazy Loaded for Bundle Splitting)
const Home = lazy(() => import('../pages/Home'));
const ProductListing = lazy(() => import('../pages/ProductListing'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Search = lazy(() => import('../pages/Search'));
const Offers = lazy(() => import('../pages/Offers'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const Terms = lazy(() => import('../pages/Terms'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const Categories = lazy(() => import('../pages/Categories'));

// Protected Pages (Lazy Loaded)
const Cart = lazy(() => import('../pages/Cart'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const Profile = lazy(() => import('../pages/Profile'));
const Addresses = lazy(() => import('../pages/Addresses'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderSuccess = lazy(() => import('../pages/OrderSuccess'));
const MyOrders = lazy(() => import('../pages/MyOrders'));
const OrderDetail = lazy(() => import('../pages/OrderDetail'));

// Special Status Pages
const Unauthorised = lazy(() => import('../pages/Unauthorised'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Suspense Fallback Loader
const RouteLoadingFallback = () => (
  <div style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
    <div className="skeleton" style={{ width: '180px', height: '36px' }}></div>
    <div className="skeleton" style={{ width: '100%', height: '320px', borderRadius: 'var(--radius-lg)' }}></div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Public Browsing Paths */}
          <Route index element={<Home />} />
          <Route path="products" element={<ProductListing />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="search" element={<Search />} />
          <Route path="offers" element={<Offers />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="categories" element={<Categories />} />

          {/* Protected Customer Routes */}
          <Route path="cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="addresses" element={
            <ProtectedRoute>
              <Addresses />
            </ProtectedRoute>
          } />
          <Route path="checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="order-success" element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          <Route path="orders/:id" element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          } />

          {/* Catch-all and Unauthorized Access */}
          <Route path="unauthorised" element={<Unauthorised />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
