'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { Moon, Sun, Paintbrush } from 'lucide-react';
import Link from 'next/link';
import { TTheme } from '@/types/themes';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleDarkMode = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme as TTheme);
  };

  // Determine if current theme is dark
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
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        {isDarkTheme ? <Moon size={20} /> : <Sun size={20} />}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52"
      >
        <li className="menu-title">
          <span>Theme Settings</span>
        </li>
        <li>
          <button onClick={toggleDarkMode} className="flex items-center gap-2">
            {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
            Switch to {isDarkTheme ? 'Light' : 'Dark'} Mode
          </button>
        </li>
        <li>
          <Link href="/themes" className="flex items-center gap-2">
            <Paintbrush size={16} />
            Customize Theme
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ThemeSwitcher;
