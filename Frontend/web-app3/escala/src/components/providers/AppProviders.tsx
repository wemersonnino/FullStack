'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { MotionConfig } from 'framer-motion';

export function AppProviders({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <MotionConfig transition={{ duration: 0.3, ease: 'easeInOut' }}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </MotionConfig>
    </NextThemesProvider>
  );
}
