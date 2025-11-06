'use client';

import { ReactNode } from 'react';
// import { useLocale } from "next-intl";
import { AppSessionProvider } from '@/components/shared/providers/SessionProvider';
import { AppThemeProvider } from '@/components/shared/providers/ThemeProvider';
import { AppTransitionProvider } from '@/components/shared/providers/TransitionProvider';
import { AppToaster } from '@/components/shared/Toaster';

export function AppProviders({ children }: { readonly children: ReactNode }) {
  /*  const locale = useLocale();

  useEffect(() => {
    setApiLocale(locale);
  }, [locale]);*/

  return (
    <AppSessionProvider>
      <AppThemeProvider>
        <AppTransitionProvider>
          <AppToaster />
          {children}
        </AppTransitionProvider>
      </AppThemeProvider>
    </AppSessionProvider>
  );
}
