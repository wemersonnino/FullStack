import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AppState {
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  locale: 'en' | 'pt';
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLocale: (locale: 'en' | 'pt') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: 'system',
      locale: 'pt',
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'escala-storage',
    }
  )
);
