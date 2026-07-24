'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { getMyPreferences } from '@/services/profile.service';
import { useAppStore } from '@/stores/app.store';

export function useSyncThemeFromStrapi() {
  const { data: session, update } = useSession();
  const { setTheme: setNextTheme } = useTheme();
  const { setTheme: setAppTheme } = useAppStore();

  const didSync = useRef(false);

  useEffect(() => {
    const token = session?.user?.token;
    if (!token) return;

    // evita ficar chamando toda renderização
    if (didSync.current) return;
    didSync.current = true;

    (async () => {
      const res = await getMyPreferences(token);

      const backendTheme = res?.data?.theme ?? ThemeEnum.SYSTEM;

      // aplica no next-themes + store
      setNextTheme(backendTheme);
      setAppTheme(backendTheme);

      // opcional: refletir na session do next-auth
      await update({ user: { ...session.user, theme: backendTheme } });
    })();
  }, [session?.user?.token, setNextTheme, setAppTheme, update, session?.user]);
}