'use client';

import { useThemeStore } from '@/store/theme-store';
import { ReactNode, useEffect } from 'react';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return children;
};
