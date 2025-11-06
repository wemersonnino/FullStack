'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { useAppStore } from '@/stores/app.store';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const { setTheme } = useAppStore();

  useEffect(() => {
    if (session?.user?.theme) {
      setTheme(session.user.theme);
    }
  }, [session, setTheme]);

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme={session?.user?.theme ?? ThemeEnum.SYSTEM}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
};
