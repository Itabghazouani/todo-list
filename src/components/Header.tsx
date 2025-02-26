'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import {
  Home,
  LayoutGrid,
  Activity,
  PaintBucket,
  Menu,
  X,
  CheckSquare,
} from 'lucide-react';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';

const AppHeader = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: Activity },
    { name: 'Matrix Guide', href: '/matrix', icon: LayoutGrid },
    { name: 'Themes', href: '/themes', icon: PaintBucket },
  ];

  return (
    <header className="bg-base-200 border-b border-base-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4 h-16">
        {/* Logo and brand */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <CheckSquare size={24} className="text-primary" />
            <span className="text-xl font-bold hidden sm:block">
              Todo Matrix
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`btn btn-sm ${
                  isActive(item.href) ? 'btn-primary' : 'btn-ghost'
                } gap-2`}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right side elements - theme switcher and user menu */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          <SignedOut>
            <div className="hidden sm:flex gap-2">
              <SignInButton mode="modal">
                <button className="btn btn-sm btn-ghost">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn btn-sm btn-primary">Sign up</button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  rootBox: 'hover:opacity-80 transition-opacity',
                },
              }}
            />
          </SignedIn>

          {/* Mobile menu button */}
          <button
            className="md:hidden btn btn-sm btn-ghost"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-base-200 border-t border-base-300 py-2">
          <nav className="flex flex-col px-4 py-2 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 p-2 rounded-md ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-content'
                      : 'text-base-content'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
            <SignedOut>
              <div className="pt-2 border-t border-base-300 mt-2 flex flex-col gap-2">
                <SignInButton mode="modal">
                  <button className="btn btn-sm btn-outline w-full">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-sm btn-primary w-full">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
