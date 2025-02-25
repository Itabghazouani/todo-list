// src/components/providers/ToastProvider.tsx
'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Import Toast with no SSR
const Toast = dynamic(() => import('../ui/Toast'), { ssr: false });

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <Toast />
    </>
  );
};
