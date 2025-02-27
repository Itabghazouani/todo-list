'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const Toast = dynamic(() => import('../ui/Toast'), { ssr: false });

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <Toast />
    </>
  );
};
