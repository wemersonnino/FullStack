"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import React from "react";
import { ThemeEnum } from "@/interfaces/enums/theme.enum";

export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme={ThemeEnum.LIGHT}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
};
