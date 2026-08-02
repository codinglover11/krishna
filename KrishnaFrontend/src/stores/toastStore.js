import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
}));

export const toast = {
  success: (msg, dur) => useToastStore.getState().addToast(msg, 'success', dur),
  error: (msg, dur) => useToastStore.getState().addToast(msg, 'error', dur),
  info: (msg, dur) => useToastStore.getState().addToast(msg, 'info', dur),
  warning: (msg, dur) => useToastStore.getState().addToast(msg, 'warning', dur),
};
