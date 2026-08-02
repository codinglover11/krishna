import { create } from 'zustand';
import api from '../services/api';
import { toast } from './toastStore';

export const useAuthStore = create((set, get) => ({
  adminUser: JSON.parse(localStorage.getItem('krishna_admin_user') || 'null'),
  accessToken: localStorage.getItem('krishna_admin_token') || null,
  isAuthenticated: !!localStorage.getItem('krishna_admin_token'),
  isLoading: false,

  setAuth: (user, token) => {
    if (user && token) {
      localStorage.setItem('krishna_admin_user', JSON.stringify(user));
      localStorage.setItem('krishna_admin_token', token);
      set({
        adminUser: user,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      localStorage.removeItem('krishna_admin_user');
      localStorage.removeItem('krishna_admin_token');
      set({
        adminUser: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  sendLoginOTP: async (email) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/admin/send-otp', { email });
      set({ isLoading: false });
      toast.success(response.data?.message || 'OTP verification code sent to piyushtewani11@gmail.com');
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      const msg = error.response?.data?.message || error.message || 'Failed to dispatch OTP verification code.';
      toast.error(msg);
      throw error;
    }
  },

  login: async (email, otp) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/admin/login', { email, otp });
      const { user, accessToken } = response.data.data;

      const roleUpper = (user?.role || user?.role_name || '').toUpperCase();
      const isAdminRole = roleUpper.includes('ADMIN') || roleUpper.includes('SUPER') || roleUpper.includes('MANAGER');

      if (!user || !isAdminRole) {
        set({ isLoading: false });
        toast.error('Access Denied: Account lacks administrative privileges.');
        throw new Error('Non-admin account');
      }

      get().setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      return user;
    } catch (error) {
      set({ isLoading: false });
      const msg = error.response?.data?.message || error.message || 'OTP login failed. Invalid or expired OTP code.';
      toast.error(msg);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/admin/logout');
    } catch (error) {
      console.warn('Logout endpoint failed or session already dead:', error);
    } finally {
      get().setAuth(null, null);
      toast.info('Admin session logged out.');
    }
  },

  verifyAdmin: async () => {
    const token = get().accessToken;
    if (!token) {
      get().setAuth(null, null);
      return false;
    }

    set({ isLoading: true });
    try {
      const response = await api.get('/admin/verify');
      const { verified, user } = response.data.data;
      const roleUpper = (user?.role_name || user?.role || '').toUpperCase();
      const isAdminRole = roleUpper.includes('ADMIN') || roleUpper.includes('SUPER') || roleUpper.includes('MANAGER');

      if (verified && user && isAdminRole) {
        const adminProfile = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role_name || user.role
        };
        get().setAuth(adminProfile, token);
        return true;
      } else {
        get().setAuth(null, null);
        return false;
      }
    } catch (error) {
      get().setAuth(null, null);
      return false;
    }
  }
}));

export default useAuthStore;
