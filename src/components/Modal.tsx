'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface IModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  closeOnOutsideClick?: boolean;
}

const Modal = ({
  children,
  modalOpen,
  setModalOpen,
  title,
  closeOnOutsideClick = true,
}: IModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false);
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore scrolling when modal closes
      document.body.style.overflow = '';
    };
  }, [modalOpen, setModalOpen]);

  // Handle clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (
      closeOnOutsideClick &&
      modalRef.current &&
      !modalRef.current.contains(e.target as Node)
    ) {
      setModalOpen(false);
    }
  };

  if (!modalOpen) return null;

  // Create portal to render modal at the root level of the DOM
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop with animation */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-in fade-in duration-300"
        onClick={handleBackdropClick}
      />

      {/* Modal content with animation */}
      <div
        ref={modalRef}
        className="relative z-50 bg-base-100 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all animate-in slide-in-from-bottom-8 duration-300"
      >
        {/* Optional title and close button */}
        {(title || closeOnOutsideClick) && (
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            {title && (
              <h3 id="modal-title" className="text-lg font-medium">
                {title}
              </h3>
            )}
            <button
              className="p-1 rounded-full hover:bg-base-200 transition-colors"
              onClick={() => setModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Modal body */}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
