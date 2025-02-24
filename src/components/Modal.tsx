'use client';

import { ReactNode } from 'react';

interface IModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  children: ReactNode;
}

const Modal = ({ children, modalOpen, setModalOpen }: IModalProps) => {
  if (!modalOpen) return null;

  return (
    // Add a fixed overlay that covers the entire viewport
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => setModalOpen(false)}
      />

      {/* Modal content - notice the higher z-index than the backdrop */}
      <div className="relative z-50 bg-base-100 rounded-lg p-6 shadow-xl max-w-md w-full mx-4 transform transition-all">
        {children}
      </div>
    </div>
  );
};

export default Modal;
