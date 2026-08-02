import { create } from 'zustand';
import api from '../services/api';
import { toast } from './toastStore';

export const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/cart');
      const { items, subtotal, discount, total } = response.data.data;
      set({
        items,
        subtotal,
        discount,
        total,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load cart details:', error);
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, variantId, quantity = 1) => {
    try {
      await api.post('/cart', { productId, productVariantId: variantId, quantity });
      // Reload cart to recalculate totals
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      const msg = error.response?.data?.message || 'Could not add item to cart.';
      toast.error(msg);
      throw error;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      await api.patch(`/cart/${itemId}`, { quantity });
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      const msg = error.response?.data?.message || 'Could not update item quantity.';
      toast.error(msg);
    }
  },

  removeItem: async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      await get().fetchCart();
      toast.info('Item removed from cart.');
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Could not remove item.');
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart');
      set({
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0
      });
      toast.info('Shopping cart cleared.');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Could not clear cart.');
    }
  }
}));

export default useCartStore;
