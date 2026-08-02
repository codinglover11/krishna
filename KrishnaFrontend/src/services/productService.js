import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data.data; // Returns { products: [], pagination: {} }
    } catch (error) {
      console.error('Failed to fetch products from backend:', error);
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch product details for ID ${id}:`, error);
      throw error;
    }
  },

  getProductBySlug: async (slug) => {
    try {
      const response = await api.get(`/products/slug/${slug}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch product details for slug ${slug}:`, error);
      throw error;
    }
  },

  getFeaturedProducts: async (limit = 4) => {
    try {
      const response = await api.get('/products/featured', { params: { limit } });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      throw error;
    }
  },

  getNewArrivals: async (limit = 4) => {
    try {
      const response = await api.get('/products/new-arrivals', { params: { limit } });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch new arrivals:', error);
      throw error;
    }
  },

  getBestSellers: async (limit = 4) => {
    try {
      const response = await api.get('/products/best-sellers', { params: { limit } });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch best sellers:', error);
      throw error;
    }
  },

  getRelatedProducts: async (id, limit = 4) => {
    try {
      const response = await api.get(`/products/related/${id}`, { params: { limit } });
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch related products for ID ${id}:`, error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }
};

export default productService;
