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

export const useAuthStore = create<AuthStore>() (
    persist(
        (set) => ({
            user: null,
            token: null,
            setAuth: (user, token) => {
                localStorage.setItem('token', token);
                set({ user, token });
            },
            clearAuth: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token }) 
        }
    )
)