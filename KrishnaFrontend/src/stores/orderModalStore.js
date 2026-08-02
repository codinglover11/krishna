import { create } from 'zustand';

export const useOrderModalStore = create((set) => ({
  isOpen: false,
  product: null,
  openModal: (product = null) => set({ isOpen: true, product }),
  closeModal: () => set({ isOpen: false, product: null }),
}));
