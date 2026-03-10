import { create } from 'zustand';
import type { AuthState, LoginResponse } from '@/types/auth';
import { queryClient } from '@/main';

const TOKEN_KEY = 'anbu_token';
const USER_KEY = 'anbu_user';

function loadPersistedState(): Pick<AuthState, 'token' | 'user'> {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    const user = userJson ? JSON.parse(userJson) as LoginResponse['user'] : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

interface AuthActions {
  login: (token: string, user: LoginResponse['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => {
  const persisted = loadPersistedState();

  return {
    token: persisted.token,
    user: persisted.user,
    isAuthenticated: !!persisted.token && !!persisted.user,
    isChefAnbu: persisted.user?.role === 'chef_anbu',

    login: (token, user) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({
        token,
        user,
        isAuthenticated: true,
        isChefAnbu: user.role === 'chef_anbu',
      });
    },

    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      queryClient.clear();
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isChefAnbu: false,
      });
    },
  };
});
