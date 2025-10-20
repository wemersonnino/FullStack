'use client'

import AppThemeProvider from './ThemeProvider'
import AppSessionProvider from './SessionProvider'
import AppTransitionProvider from './AppTransitionProvider'
import AppToaster from './Toaster'
import React from 'react';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppSessionProvider>
      <AppThemeProvider>
        <AppTransitionProvider>
          <AppToaster />
          {children}
        </AppTransitionProvider>
      </AppThemeProvider>
    </AppSessionProvider>
  )
}