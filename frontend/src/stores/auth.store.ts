import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'USER' | 'AUTHOR' | 'ADMIN'

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    role: Role;
}

interface AuthStore {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
}

// auth.store.ts
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }), 
      clearAuth: () => set({ user: null, token: null }), 
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);