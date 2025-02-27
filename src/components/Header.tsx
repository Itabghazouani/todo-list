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
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <CheckSquare size={24} className="text-primary" />
            <span className="text-xl font-bold hidden sm:block">
              Todo Matrix
            </span>
          </Link>
        </div>

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

          <button
            className="md:hidden btn btn-sm btn-ghost"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu - positioned on the right side */}
      <div
        className={`fixed top-16 right-0 h-screen bg-base-200 border-l border-base-300 shadow-lg transition-transform duration-300 ease-in-out z-50 w-64 md:hidden ${
          isMobileMenuOpen ? 'transform-none' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col p-4 space-y-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-content'
                    : 'text-base-content hover:bg-base-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
          <SignedOut>
            <div className="pt-3 border-t border-base-300 mt-3 flex flex-col gap-2">
              <SignInButton mode="modal">
                <button
                  className="btn btn-sm btn-outline w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="btn btn-sm btn-primary w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
        </nav>
      </div>

      {/* Overlay to close menu when clicking outside */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default AppHeader;
