import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Initial state from localStorage
// Utility to parse JWT safely
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const storedToken = localStorage.getItem('krishna_token') || localStorage.getItem('authToken') || null;
const decodedUser = storedToken ? parseJwt(storedToken) : null;
const storedUser = decodedUser || (localStorage.getItem('krishna_user') ? JSON.parse(localStorage.getItem('krishna_user')) : null);

export const useAuthStore = create((set, get) => ({
  user: storedUser,
  accessToken: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  actionQueue: [], // Queue for guest actions to run after login

  setAuth: (user, accessToken) => {
    if (accessToken) {
      localStorage.setItem('krishna_token', accessToken);
      localStorage.setItem('authToken', accessToken);
      const decodedUser = parseJwt(accessToken) || user;
      if (decodedUser) {
        localStorage.setItem('krishna_user', JSON.stringify(decodedUser));
      }
      set({
        user: decodedUser,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      localStorage.removeItem('krishna_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('krishna_user');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setLoading: (isLoading) => set({ isLoading }),

  // Queue a callback to run immediately after successful login
  queueAction: (callback) => {
    set((state) => ({
      actionQueue: [...state.actionQueue, callback],
    }));
  },

  clearQueue: () => set({ actionQueue: [] }),

  // Execute all queued actions (usually run after successful login)
  executeQueue: () => {
    const { actionQueue } = get();
    actionQueue.forEach((callback) => {
      try {
        callback();
      } catch (err) {
        console.error('Error executing queued guest action:', err);
      }
    });
    set({ actionQueue: [] });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      
      const payload = response.data?.data || response.data;
      const { user, accessToken } = payload;
      
      get().setAuth(user, accessToken);

      // Execute any guest-intercepted actions
      get().executeQueue();
      return payload;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });
      set({ isLoading: false });
      return response.data?.data || response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout request failed on server:', error);
    } finally {
      get().setAuth(null, null);
      set({ actionQueue: [] });
    }
  },

  // Check auth session on application load / page refresh
  checkAuth: async () => {
    const token = get().accessToken;
    if (token && get().user) {
      set({ isAuthenticated: true, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const payload = response.data?.data || response.data;
      const { user, accessToken } = payload;
      if (user && accessToken) {
        get().setAuth(user, accessToken);
      } else {
        get().setAuth(null, null);
      }
    } catch (error) {
      // If refresh fails and no stored token exists
      if (!storedToken) {
        get().setAuth(null, null);
      } else {
        set({ isLoading: false });
      }
    }
  },
}));

export default useAuthStore;
