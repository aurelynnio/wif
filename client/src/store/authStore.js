import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/axios/axiosConfig';
import { AUTH_API } from '@/axios/apiEndpoint';
import { extractData } from '@/utils/apiUtils';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  sessions: [],
  twoFactorEnabled: false,
  twoFactorPending: false,
  _hasHydrated: false,
};

export const useAuthStore = create(
  persist(
    set => ({
      ...initialState,

      // Hydration state
      setHasHydrated: state => set({ _hasHydrated: state }),

      // Sync Reducers / Setters
      clearError: () => set({ error: null }),
      setUser: user => set({ user, isAuthenticated: !!user }),
      setIsAuthenticated: isAuthenticated => set({ isAuthenticated }),
      updateUserProfile: profileData =>
        set(state => {
          if (!state.user) return { user: profileData };
          // If server returns { user: {...} } or direct object
          const updated = profileData?.user ? { ...state.user, ...profileData.user } : { ...state.user, ...profileData };
          return { user: updated };
        }),
      resetAuthState: () => set({ ...initialState, _hasHydrated: true }),

      // ========== Async Authentication Actions ==========

      login: async ({ email, password, twoFactorToken }) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post(AUTH_API.LOGIN, {
            email,
            password,
            twoFactorToken,
          });
          const data = extractData(response);
          set({
            loading: false,
            user: data,
            isAuthenticated: true,
            twoFactorEnabled: data?.twoFactorEnabled || false,
          });
          return { success: true, data };
        } catch (error) {
          const errorPayload = {
            message: error.response?.data?.message || 'Đăng nhập thất bại',
            errorCode: error.response?.data?.errorCode,
            status: error.response?.status,
          };
          set({ loading: false, error: errorPayload });
          return { success: false, error: errorPayload };
        }
      },

      register: async ({ email, password, username, name }) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post(AUTH_API.REGISTER, {
            email,
            password,
            username,
            name,
          });
          const data = extractData(response);
          set({
            loading: false,
            user: data,
            isAuthenticated: true,
          });
          return { success: true, data };
        } catch (error) {
          const message = error.response?.data?.message || 'Đăng ký thất bại';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      googleAuth: async arg => {
        set({ loading: true, error: null });
        try {
          const credential = typeof arg === 'string' ? arg : arg?.credential;
          if (!credential) {
            throw new Error('Google credential is required');
          }
          const response = await api.post(AUTH_API.GOOGLE_AUTH, { credential });
          const data = extractData(response);
          set({
            loading: false,
            user: data,
            isAuthenticated: true,
          });
          return { success: true, data };
        } catch (error) {
          const message =
            error.response?.data?.message || error.message || 'Đăng nhập Google thất bại';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await api.post(AUTH_API.LOGOUT);
        } catch {
          // Ignore logout error and clear state anyway
        } finally {
          set({ ...initialState, _hasHydrated: true });
        }
        return { success: true };
      },

      logoutAll: async () => {
        set({ loading: true });
        try {
          await api.post(AUTH_API.LOGOUT_ALL);
        } catch {
          // Ignore logout error and clear state anyway
        } finally {
          set({ ...initialState, _hasHydrated: true });
        }
        return { success: true };
      },

      // ========== Password ==========

      updatePassword: async ({ currentPassword, newPassword }) => {
        set({ loading: true, error: null });
        try {
          const response = await api.put(AUTH_API.UPDATE_PASSWORD, {
            currentPassword,
            newPassword,
          });
          const data = extractData(response);
          set({ loading: false });
          return { success: true, data };
        } catch (error) {
          const message =
            error.response?.data?.message || 'Cập nhật mật khẩu thất bại';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      requestPasswordReset: async ({ email }) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post(AUTH_API.REQUEST_PASSWORD_RESET, {
            email,
          });
          const data = extractData(response);
          set({ loading: false });
          return { success: true, data };
        } catch (error) {
          const message =
            error.response?.data?.message || 'Gửi yêu cầu đặt lại mật khẩu thất bại';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      resetPassword: async ({ token, newPassword }) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post(AUTH_API.RESET_PASSWORD, {
            token,
            newPassword,
          });
          const data = extractData(response);
          set({ loading: false });
          return { success: true, data };
        } catch (error) {
          const message =
            error.response?.data?.message || 'Đặt lại mật khẩu thất bại';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      // ========== 2FA ==========

      enable2FA: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.post(AUTH_API.ENABLE_2FA);
          const data = extractData(response);
          set({ loading: false, twoFactorPending: true });
          return { success: true, data };
        } catch (error) {
          const message = error.response?.data?.message || 'Bật 2FA thất bại';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      verify2FA: async ({ token }) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post(AUTH_API.VERIFY_2FA, { token });
          const data = extractData(response);
          set({
            loading: false,
            twoFactorEnabled: true,
            twoFactorPending: false,
          });
          return { success: true, data };
        } catch (error) {
          const message = error.response?.data?.message || 'Xác thực 2FA thất bại';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      disable2FA: async ({ password }) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post(AUTH_API.DISABLE_2FA, { password });
          const data = extractData(response);
          set({ loading: false, twoFactorEnabled: false });
          return { success: true, data };
        } catch (error) {
          const message = error.response?.data?.message || 'Tắt 2FA thất bại';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      // ========== Sessions ==========

      getSessions: async () => {
        try {
          const response = await api.get(AUTH_API.GET_SESSIONS);
          const data = extractData(response);
          const sessions = data?.sessions || (Array.isArray(data) ? data : []);
          set({ sessions });
          return { success: true, data: sessions };
        } catch (error) {
          const message =
            error.response?.data?.message || 'Lấy danh sách phiên thất bại';
          return { success: false, error: message };
        }
      },

      revokeSession: async arg => {
        try {
          const sessionId = typeof arg === 'string' ? arg : arg?.sessionId || arg?._id || arg?.id;
          await api.delete(AUTH_API.REVOKE_SESSION(sessionId));
          set(state => ({
            sessions: state.sessions.filter(
              s => (s.id || s._id || s.sessionId) !== sessionId
            ),
          }));
          return { success: true, data: { sessionId } };
        } catch (error) {
          const message =
            error.response?.data?.message || 'Thu hồi phiên thất bại';
          return { success: false, error: message };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        twoFactorEnabled: state.twoFactorEnabled,
      }),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    }
  )
);

