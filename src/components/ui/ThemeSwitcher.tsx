'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { Moon, Sun, Paintbrush } from 'lucide-react';
import Link from 'next/link';
import { TTheme } from '@/types/themes';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleDarkMode = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme as TTheme);
  };

  const isDarkTheme = [
    'dark',
    'synthwave',
    'halloween',
    'forest',
    'black',
    'luxury',
    'dracula',
    'night',
    'coffee',
    'dim',
    'nord',
  ].includes(theme);

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle"
        aria-label={`Toggle theme, current theme is ${
          isDarkTheme ? 'dark' : 'light'
        }`}
      >
        {isDarkTheme ? <Moon size={20} /> : <Sun size={20} />}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-48 mt-2"
      >
        <li className="menu-title">
          <span className="text-sm">Theme Settings</span>
        </li>
        <li>
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 py-2"
          >
            {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
            <span className="text-sm">
              Switch to {isDarkTheme ? 'Light' : 'Dark'} Mode
            </span>
          </button>
        </li>
        <li>
          <Link href="/themes" className="flex items-center gap-2 py-2">
            <Paintbrush size={16} />
            <span className="text-sm">Customize Theme</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ThemeSwitcher;
