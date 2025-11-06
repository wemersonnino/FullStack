import { create } from "zustand/react";
import { ThemeEnum } from "@/interfaces/enums/theme.enum"

type AppState = {
  loading: boolean;
  setLoading: (v: boolean) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: ThemeEnum
  setTheme: (t: ThemeEnum) => void
};

export const useAppStore = create<AppState>((set) => ({
  loading: false,
  setLoading: (v) => set({ loading: v }),
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  theme: ThemeEnum.SYSTEM,
  setTheme: (t) => set({ theme: t }),
}));
