import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import apiClient from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  display_name: string;
  role: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  is_verified: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  fetchProfile: () => Promise<void>;
}

/** Type guard for axios-shaped errors with a response body */
function isAxiosLikeError(err: unknown): err is { response: { data: { message?: string } } } {
  if (!axios.isAxiosError(err)) return false;
  return (
    typeof err.response === 'object' &&
    err.response !== null &&
    typeof err.response.data === 'object' &&
    err.response.data !== null
  );
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosLikeError(err) && typeof err.response.data.message === 'string') {
    return err.response.data.message;
  }
  return fallback;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.post('/auth/login', { email, password });
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isLoading: false,
          });
        } catch (err: unknown) {
          set({
            error: getErrorMessage(err, 'Login failed'),
            isLoading: false,
          });
          throw err;
        }
      },

      register: async (email, password, display_name) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.post('/auth/register', { email, password, display_name });
          set({ isLoading: false });
        } catch (err: unknown) {
          set({
            error: getErrorMessage(err, 'Registration failed'),
            isLoading: false,
          });
          throw err;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await apiClient.post('/auth/logout', { refresh_token: refreshToken });
          }
        } catch (err: unknown) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[auth-store] logout failed:', err);
          }
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const { data } = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          });
          return true;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
          return false;
        }
      },

      fetchProfile: async () => {
        try {
          const { data } = await apiClient.get('/users/me');
          set({ user: data });
        } catch (err: unknown) {
          const message = getErrorMessage(err, 'Failed to fetch profile');
          if (process.env.NODE_ENV === 'development') {
            console.error('[auth-store] fetchProfile failed:', err);
          }
          set({ error: message });
        }
      },
    }),
    {
      name: 'iloveberlin-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
