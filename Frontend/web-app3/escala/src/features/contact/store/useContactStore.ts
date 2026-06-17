import { create } from 'zustand';

interface ContactState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setSuccess: (success: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useContactStore = create<ContactState>((set) => ({
  isLoading: false,
  isSuccess: false,
  error: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setSuccess: (success) => set({ isSuccess: success }),
  setError: (error) => set({ error }),
  reset: () => set({ isLoading: false, isSuccess: false, error: null }),
}));
