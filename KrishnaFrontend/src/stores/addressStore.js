import { create } from 'zustand';
import api from '../services/api';
import { toast } from './toastStore';

export const useAddressStore = create((set, get) => ({
  addresses: [],
  isLoading: false,

  fetchAddresses: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/addresses');
      set({ addresses: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Failed to load addresses:', error);
      set({ isLoading: false });
    }
  },

  addAddress: async (addressData) => {
    try {
      await api.post('/addresses', addressData);
      toast.success('Address added successfully.');
      await get().fetchAddresses();
    } catch (error) {
      console.error('Failed to add address:', error);
      toast.error('Could not save new address.');
      throw error;
    }
  },

  editAddress: async (id, addressData) => {
    try {
      await api.patch(`/addresses/${id}`, addressData);
      toast.success('Address updated successfully.');
      await get().fetchAddresses();
    } catch (error) {
      console.error('Failed to update address:', error);
      toast.error('Could not update address.');
      throw error;
    }
  },

  deleteAddress: async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      toast.success('Address deleted successfully.');
      await get().fetchAddresses();
    } catch (error) {
      console.error('Failed to delete address:', error);
      toast.error('Could not delete address.');
    }
  },

  setDefaultAddress: async (id) => {
    try {
      await api.patch(`/addresses/${id}/default`);
      toast.success('Default address updated.');
      await get().fetchAddresses();
    } catch (error) {
      console.error('Failed to set default address:', error);
      toast.error('Could not update default address.');
    }
  }
}));

export default useAddressStore;
