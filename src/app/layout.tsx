import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import AppHeader from '@/components/Header';

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
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
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
              <AppHeader />
              <main className="min-h-[calc(100vh-4rem)]  w-full max-w-full overflow-x-hidden">
                {children}
              </main>
            </ToastProvider>
          </body>
        </ThemeProvider>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
