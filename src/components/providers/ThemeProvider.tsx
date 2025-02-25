'use client';

import { useThemeStore } from '@/store/themeStore';
import { ReactNode, useEffect, useState } from 'react';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // This effect runs only once when the component mounts
  useEffect(() => {
    // Get the system preference for dark/light mode
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;

    // Get the stored theme or use system preference as fallback
    const storedTheme = localStorage.getItem('theme-storage');
    const initialTheme = storedTheme
      ? JSON.parse(storedTheme)?.state?.theme
      : systemPrefersDark
      ? 'dark'
      : 'light';

    // Set the initial theme
    document.documentElement.setAttribute('data-theme', initialTheme);

    // Mark as mounted to prevent hydration mismatch
    setMounted(true);
  }, []);

  // This effect runs when the theme changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  // Only render children after initial mount to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default ThemeProvider;
