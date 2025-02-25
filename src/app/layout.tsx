import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { ThemeSwitcher } from '@/components/ui';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Todo App - Eisenhower Matrix',
  description: 'Organize your tasks using the Eisenhower Matrix',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <ClerkProvider>
      <html lang="en">
        <ThemeProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-base-100 text-base-content min-h-screen`}
          >
            <ToastProvider>
              <header className="bg-base-200 border-b border-base-300">
                <div className="max-w-7xl mx-auto flex justify-end items-center p-4 gap-4 h-16">
                  <ThemeSwitcher />
                  <SignedOut>
                    <div className="flex gap-2">
                      <SignInButton mode="modal">
                        <button className="btn btn-sm btn-ghost">
                          Sign in
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="btn btn-sm btn-primary">
                          Sign up
                        </button>
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
                </div>
              </header>
              <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            </ToastProvider>
          </body>
        </ThemeProvider>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
