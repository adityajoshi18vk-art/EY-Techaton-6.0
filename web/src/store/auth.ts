import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'customer' | 'employee';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      selectedRole: null,
      setSelectedRole: (role) => {
        set({ selectedRole: role });
      },
      login: (user, token) => {
        localStorage.setItem('auth-token', token);
        set({ user, token, isAuthenticated: true, selectedRole: user.role });
      },
      logout: () => {
        localStorage.removeItem('auth-token');
        set({ user: null, token: null, isAuthenticated: false, selectedRole: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
