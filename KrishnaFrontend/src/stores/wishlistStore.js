import { create } from 'zustand';
import api from '../services/api';
import { toast } from './toastStore';
import { useCartStore } from './cartStore';

export const useWishlistStore = create((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/wishlist');
      set({ items: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Failed to load wishlist items:', error);
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId) => {
    const { items } = get();
    const isWishlisted = items.some((item) => item.product_id === productId);

    try {
      if (isWishlisted) {
        // Optimistic update: remove locally first
        set({ items: items.filter((item) => item.product_id !== productId) });
        await api.delete(`/wishlist/${productId}`);
        toast.info('Removed product from Wishlist.');
      } else {
        await api.post('/wishlist', { productId });
        await get().fetchWishlist();
        toast.success('Added product to Wishlist.');
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      toast.error('Could not update wishlist bookmark.');
      // Revert/refresh on failure
      get().fetchWishlist();
    }
  },

  moveToCart: async (productId, variantId) => {
    try {
      await api.post(`/wishlist/${productId}/move-to-cart`, { variantId });
      toast.success('Item moved to Shopping Cart.');
      
      // Reload both stores in parallel to refresh counts
      await Promise.all([
        get().fetchWishlist(),
        useCartStore.getState().fetchCart()
      ]);
    } catch (error) {
      console.error('Failed to move item to cart:', error);
      const msg = error.response?.data?.message || 'Could not move item to cart.';
      toast.error(msg);
    }
  }
}));

export default useWishlistStore;
