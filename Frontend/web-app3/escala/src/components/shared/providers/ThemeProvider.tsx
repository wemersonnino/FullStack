'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/stores/app.store';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';

type ThemeValue = ThemeEnum.LIGHT | ThemeEnum.DARK | ThemeEnum.SYSTEM;

interface ThemeContextValue {
  theme: ThemeValue;
  resolvedTheme: ThemeEnum.LIGHT | ThemeEnum.DARK;
  setTheme: (theme: ThemeValue) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ThemeEnum.LIGHT | ThemeEnum.DARK {
  if (typeof window === 'undefined') return ThemeEnum.LIGHT;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? ThemeEnum.DARK : ThemeEnum.LIGHT;
}

function readStoredTheme(): ThemeValue {
  if (typeof window === 'undefined') return ThemeEnum.SYSTEM;
  const stored = window.localStorage.getItem('theme');
  return stored === ThemeEnum.LIGHT || stored === ThemeEnum.DARK || stored === ThemeEnum.SYSTEM
    ? stored
    : ThemeEnum.SYSTEM;
}

function applyTheme(theme: ThemeValue, resolvedTheme: ThemeEnum.LIGHT | ThemeEnum.DARK) {
  if (typeof document === 'undefined') return;

  document.documentElement.classList.toggle(ThemeEnum.DARK, resolvedTheme === ThemeEnum.DARK);
  document.documentElement.classList.toggle(ThemeEnum.LIGHT, resolvedTheme === ThemeEnum.LIGHT);
  document.documentElement.style.colorScheme = resolvedTheme;

  try {
    window.localStorage.setItem('theme', theme);
  } catch {
    // Local storage can be unavailable in private browsing or strict browser settings.
  }
}

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const { setTheme: setAppTheme } = useAppStore();
  const [theme, setThemeState] = useState<ThemeValue>(() => readStoredTheme());
  const [systemTheme, setSystemTheme] = useState<ThemeEnum.LIGHT | ThemeEnum.DARK>(() => getSystemTheme());

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemTheme(getSystemTheme());
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const activeTheme = (session?.user?.theme as ThemeValue | undefined) ?? theme;
  const resolvedTheme = activeTheme === ThemeEnum.SYSTEM ? systemTheme : activeTheme;

  useEffect(() => {
    setAppTheme(activeTheme);
    applyTheme(activeTheme, resolvedTheme);
  }, [activeTheme, resolvedTheme, setAppTheme]);

  const setTheme = useCallback((nextTheme: ThemeValue) => {
    setThemeState(nextTheme);
  }, []);

  const value = useMemo(
    () => ({
      theme: activeTheme,
      resolvedTheme,
      setTheme,
    }),
    [activeTheme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider.');
  }
  return context;
}
