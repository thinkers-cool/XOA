import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import { User } from '@/interface/User';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/usePermissions';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  userLoading: boolean;
  authError: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setUserLoading: (loading: boolean) => void;
  setAuthError: (authError: string | null) => void;
  login: (username: string, password: string, t: (key: string) => string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: (t: (key: string) => string) => Promise<void>;
  refreshAccessToken: (t: (key: string) => string) => Promise<void>;
  isAuthenticated: () => boolean;
}
export const useAuth = create<AuthState>()(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      userLoading: false,
      authError: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      setUserLoading: (userLoading) => set({ userLoading }),
      setAuthError: (authError) => set({ authError }),
      login: async (username: string, password: string, t: (key: string) => string) => {
        try {
          set({ userLoading: true, authError: null });
          const params = new URLSearchParams();
          params.append('username', username);
          params.append('password', password);
          const response = await api.post('/users/login', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });
          set({
            token: response.data.access_token,
            refreshToken: response.data.refresh_token
          });
          await get().fetchCurrentUser(t);
        } catch (err: unknown) {
          let errorMessage = t('auth.errors.connectionFailed');
          if (err && typeof err === 'object' && 'response' in err) {
            const error = err as { response?: { status: number; data?: { detail?: string } } };
            if (error.response) {
              switch (error.response.status) {
                case 401:
                  errorMessage = t('auth.errors.incorrectCredentials');
                  break;
                case 403:
                  errorMessage = t('auth.errors.accountLocked');
                  break;
                case 404:
                  errorMessage = t('auth.errors.userNotFound');
                  break;
                case 429:
                  errorMessage = t('auth.errors.tooManyAttempts');
                  break;
                case 500:
                  errorMessage = t('auth.errors.serverError');
                  break;
                default:
                  errorMessage = error.response.data?.detail || t('auth.errors.defaultError');
              }
            }
          }
          set({ authError: errorMessage });
          throw err;
        } finally {
          set({ userLoading: false });
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          authError: null
        });
        usePermissions.getState().clearPermissions();
      },
      fetchCurrentUser: async (t: (key: string) => string) => {
        try {
          set({ userLoading: true, authError: null });
          const response = await api.get('/users/me');
          set({ user: response.data });
          await usePermissions.getState().fetchUserPermissions();
        } catch (err: unknown) {
          const errorMessage = err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || t('auth.errors.fetchUserFailed')
            : t('auth.errors.fetchUserFailed');
          set({ authError: errorMessage });
          throw err;
        } finally {
          set({ userLoading: false });
        }
      },
      refreshAccessToken: async (t: (key: string) => string) => {
        try {
          const currentRefreshToken = get().refreshToken;
          if (!currentRefreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await api.post('/users/refresh', null, {
            headers: { Authorization: `Bearer ${currentRefreshToken}` }
          });

          if (response.data.access_token && response.data.refresh_token) {
            set({
              token: response.data.access_token,
              refreshToken: response.data.refresh_token
            });
          } else {
            // If tokens are not returned, it means they're invalid (possibly due to password change)
            set({
              token: null,
              refreshToken: null,
              user: null,
              authError: t('auth.errors.sessionExpired')
            });
            throw new Error('Invalid tokens');
          }
        } catch (err: unknown) {
          const { t } = useTranslation();
          const errorMessage = err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || t('auth.errors.sessionExpired')
            : t('auth.errors.sessionExpired');
          set({ authError: errorMessage });
          throw err;
        }
      },
      isAuthenticated: () => {
        return !!get().token;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        userLoading: state.userLoading,
        authError: state.authError,
        setUser: state.setUser,
        setToken: state.setToken,
        setRefreshToken: state.setRefreshToken,
        setUserLoading: state.setUserLoading,
        setAuthError: state.setAuthError,
        login: state.login,
        logout: state.logout,
        fetchCurrentUser: state.fetchCurrentUser,
        refreshAccessToken: state.refreshAccessToken,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);