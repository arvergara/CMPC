import { create } from 'zustand';
import { AuthState, User } from '../types/auth';
import { authService } from '../services/auth.service';

interface AuthStore extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (token: string, user: User) => {
    authService.storeAuth(token, user);
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  loadFromStorage: () => {
    const token = authService.getStoredToken();
    const user = authService.getStoredUser();

    if (token && user) {
      set({
        user,
        token,
        isAuthenticated: true,
      });
    }
  },
}));
