import { create } from "zustand/react";

type AppState = {
  loading: boolean;
  setLoading: (v: boolean) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  loading: false,
  setLoading: (v) => set({ loading: v }),
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
