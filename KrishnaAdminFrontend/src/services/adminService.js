import api from './api';

export const adminService = {
  // Image Upload to Cloudinary via CommonBackend
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },

  // Dashboard Analytics
  getDashboardOverview: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data.data;
  },

  getDashboardCharts: async () => {
    const res = await api.get('/admin/dashboard/charts');
    return res.data.data;
  },

  getDashboardRevenue: async () => {
    const res = await api.get('/admin/dashboard/revenue');
    return res.data.data;
  },

  getDashboardOrders: async () => {
    const res = await api.get('/admin/dashboard/orders');
    return res.data.data;
  },

  getDashboardProducts: async () => {
    const res = await api.get('/admin/dashboard/products');
    return res.data.data;
  },

  getDashboardCustomers: async () => {
    const res = await api.get('/admin/dashboard/customers');
    return res.data.data;
  },

  // Product Management
  getProducts: async (params = {}) => {
    const res = await api.get('/products', { params: { includeDeleted: true, ...params } });
    return res.data.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data.data;
  },

  createProduct: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data.data;
  },

  updateProduct: async (id, productData) => {
    const res = await api.patch(`/products/${id}`, productData);
    return res.data.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data.data;
  },

  restoreProduct: async (id) => {
    const res = await api.patch(`/products/${id}/restore`);
    return res.data.data;
  },

  toggleProductStatus: async (id, isActive) => {
    const res = await api.patch(`/products/${id}/status`, { isActive });
    return res.data.data;
  },

  duplicateProduct: async (id) => {
    const res = await api.post(`/products/${id}/duplicate`);
    return res.data.data;
  },

  // Category Management
  getCategories: async (params = {}) => {
    const res = await api.get('/categories', { params: { includeDeleted: true, ...params } });
    return res.data.data;
  },

  getCategoryById: async (id) => {
    const res = await api.get(`/categories/${id}`);
    return res.data.data;
  },

  createCategory: async (categoryData) => {
    const res = await api.post('/categories', categoryData);
    return res.data.data;
  },

  updateCategory: async (id, categoryData) => {
    const res = await api.patch(`/categories/${id}`, categoryData);
    return res.data.data;
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data.data;
  },

  restoreCategory: async (id) => {
    const res = await api.patch(`/categories/${id}/restore`);
    return res.data.data;
  },

  // Inventory Management
  getInventory: async (params = {}) => {
    const res = await api.get('/inventory', { params });
    return res.data.data;
  },

  getMetadata: async () => {
    const res = await api.get('/inventory/metadata');
    return res.data.data;
  },

  updateVariantStock: async (variantId, stockQuantity) => {
    const res = await api.patch(`/inventory/variants/${variantId}`, { stockQuantity });
    return res.data.data;
  },

  // Order Management
  getAdminOrders: async (params = {}) => {
    const res = await api.get('/admin/orders', { params });
    return res.data.data;
  },

  getAdminOrderById: async (id) => {
    const res = await api.get(`/admin/orders/${id}`);
    return res.data.data;
  },

  updateOrderStatus: async (id, status, notes) => {
    const res = await api.patch(`/admin/orders/${id}/status`, { status, notes });
    return res.data.data;
  },

  // Customer Management
  getAdminCustomers: async (params = {}) => {
    const res = await api.get('/admin/customers', { params });
    return res.data.data;
  },

  getAdminCustomerById: async (id) => {
    const res = await api.get(`/admin/customers/${id}`);
    return res.data.data;
  },

  getAdminCustomerOrders: async (id) => {
    const res = await api.get(`/admin/customers/${id}/orders`);
    return res.data.data;
  },

  toggleCustomerStatus: async (id, isActive) => {
    const res = await api.patch(`/admin/customers/${id}/status`, { isActive });
    return res.data.data;
  },

  // Banner Management
  getAdminBanners: async (params = {}) => {
    const res = await api.get('/banners/admin', { params: { includeDeleted: true, ...params } });
    return res.data.data;
  },

  createBanner: async (bannerData) => {
    const res = await api.post('/banners', bannerData);
    return res.data.data;
  },

  updateBanner: async (id, bannerData) => {
    const res = await api.patch(`/banners/${id}`, bannerData);
    return res.data.data;
  },

  deleteBanner: async (id) => {
    const res = await api.delete(`/banners/${id}`);
    return res.data.data;
  },

  restoreBanner: async (id) => {
    const res = await api.patch(`/banners/${id}/restore`);
    return res.data.data;
  },

  // Offer Management
  getAdminOffers: async (params = {}) => {
    const res = await api.get('/offers/admin', { params });
    return res.data.data;
  },

  createOffer: async (offerData) => {
    const res = await api.post('/offers', offerData);
    return res.data.data;
  },

  updateOffer: async (id, offerData) => {
    const res = await api.patch(`/offers/${id}`, offerData);
    return res.data.data;
  },

  deleteOffer: async (id) => {
    const res = await api.delete(`/offers/${id}`);
    return res.data.data;
  },

  // Coupon Management
  getAdminCoupons: async (params = {}) => {
    const res = await api.get('/coupons/admin', { params });
    return res.data.data;
  },

  createCoupon: async (couponData) => {
    const res = await api.post('/coupons', couponData);
    return res.data.data;
  },

  updateCoupon: async (id, couponData) => {
    const res = await api.patch(`/coupons/${id}`, couponData);
    return res.data.data;
  },

  deleteCoupon: async (id) => {
    const res = await api.delete(`/coupons/${id}`);
    return res.data.data;
  },

  // Review Management
  getAdminReviews: async (params = {}) => {
    const res = await api.get('/admin/reviews', { params });
    return res.data.data;
  },

  getReviewById: async (id) => {
    const res = await api.get(`/admin/reviews/${id}`);
    return res.data.data;
  },

  updateReviewStatus: async (id, status) => {
    const res = await api.patch(`/admin/reviews/${id}/status`, { status });
    return res.data.data;
  },

  deleteReview: async (id) => {
    const res = await api.delete(`/admin/reviews/${id}`);
    return res.data.data;
  },

  // RBAC & Admin User Management
  getAdminUserAccounts: async () => {
    const res = await api.get('/admin/rbac/users');
    return res.data.data;
  },

  createAdminUserAccount: async (userData) => {
    const res = await api.post('/admin/rbac/users', userData);
    return res.data.data;
  },

  toggleAdminUserStatus: async (id, isActive) => {
    const res = await api.patch(`/admin/rbac/users/${id}/status`, { isActive });
    return res.data.data;
  },

  getRoles: async () => {
    const res = await api.get('/admin/rbac/roles');
    return res.data.data;
  },

  createRole: async (roleData) => {
    const res = await api.post('/admin/rbac/roles', roleData);
    return res.data.data;
  },

  getPermissions: async () => {
    const res = await api.get('/admin/rbac/permissions');
    return res.data.data;
  },

  updateRolePermissions: async (roleId, permissionCodes) => {
    const res = await api.patch(`/admin/rbac/roles/${roleId}/permissions`, { permissionCodes });
    return res.data.data;
  },

  // Store Settings Management
  getStoreSettings: async () => {
    const res = await api.get('/settings');
    return res.data.data;
  },

  updateStoreSettings: async (settingsData) => {
    const res = await api.patch('/settings', settingsData);
    return res.data.data;
  },

  // Notification Center
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data.data;
  },

  markNotificationRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllNotificationsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data.data;
  },

  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data.data;
  },

  // Admin Audit Logs
  getAuditLogs: async (params = {}) => {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data.data;
  },

  // Media Management System
  uploadMediaImage: async (file, folder = 'products') => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/media/upload?folder=${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },

  uploadMultipleMediaImages: async (files, folder = 'products') => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await api.post(`/media/multiple-upload?folder=${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },

  deleteMediaImage: async (publicId) => {
    const encodedId = encodeURIComponent(publicId);
    const res = await api.delete(`/media/${encodedId}`);
    return res.data.data;
  }
};

export default adminService;
