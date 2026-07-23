import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, JWTResponse } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  sessionExpiresAt: number | null;

  // Actions
  setCredentials: (data: JWTResponse, rememberMe?: boolean) => void;
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setRememberMe: (remember: boolean) => void;
  isSessionExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      rememberMe: false,
      sessionExpiresAt: null,

      setCredentials: (data: JWTResponse, rememberMe = false) => {
        const now = Date.now();
        // Access token: 8 hours, Refresh token: 7 days
        const accessLifetime = rememberMe ? 8 * 60 * 60 * 1000 : 30 * 60 * 1000; // 8h or 30min
        const refreshLifetime = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7d or 1d

        set({
          accessToken: data.access,
          refreshToken: data.refresh,
          isAuthenticated: true,
          rememberMe,
          sessionExpiresAt: now + accessLifetime,
        });

        // Store tokens with appropriate expiry
        if (rememberMe) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          localStorage.setItem('session_expires_at', String(now + accessLifetime));
        } else {
          sessionStorage.setItem('access_token', data.access);
          sessionStorage.setItem('refresh_token', data.refresh);
          sessionStorage.setItem('session_expires_at', String(now + accessLifetime));
        }
      },

      setUser: (user: User) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      updateUser: (partial: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      logout: () => {
        const state = get();
        if (state.rememberMe) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('session_expires_at');
        } else {
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          sessionStorage.removeItem('session_expires_at');
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          rememberMe: false,
          sessionExpiresAt: null,
        });
      },

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),

      setRememberMe: (remember: boolean) =>
        set({ rememberMe: remember }),

      isSessionExpired: () => {
        const state = get();
        if (!state.sessionExpiresAt) return true;
        return Date.now() > state.sessionExpiresAt;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.rememberMe ? state.accessToken : null,
        refreshToken: state.rememberMe ? state.refreshToken : null,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
        sessionExpiresAt: state.rememberMe ? state.sessionExpiresAt : null,
      }),
    }
  )
);
