'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { useAppStore } from '@/stores/app.store';

export function useSyncThemeFromStrapi() {
  const { data: session, update } = useSession();
  const { setTheme: setNextTheme } = useTheme();
  const { setTheme: setAppTheme } = useAppStore();

  const didSync = useRef(false);

  useEffect(() => {
    if (!session?.user) return;

    // evita ficar chamando toda renderização
    if (didSync.current) return;
    didSync.current = true;

    const backendTheme = session.user.theme ?? ThemeEnum.SYSTEM;

    setNextTheme(backendTheme);
    setAppTheme(backendTheme);

    if (session.user.theme !== backendTheme) {
      void update({ user: { ...session.user, theme: backendTheme } });
    }
  }, [session?.user, setNextTheme, setAppTheme, update]);
}
