'use client';

import { useThemeStore } from '@/store/themeStore';
import { ReactNode, useEffect, useState } from 'react';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;

    const storedTheme = localStorage.getItem('theme-storage');
    const initialTheme = storedTheme
      ? JSON.parse(storedTheme)?.state?.theme
      : systemPrefersDark
      ? 'dark'
      : 'light';

    document.documentElement.setAttribute('data-theme', initialTheme);

    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default ThemeProvider;
