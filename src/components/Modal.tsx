'use client';

import { MouseEvent, ReactNode, useEffect, useRef } from 'react';
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false);
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [modalOpen, setModalOpen]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (
      closeOnOutsideClick &&
      modalRef.current &&
      !modalRef.current.contains(e.target as Node)
    ) {
      setModalOpen(false);
    }
  };

  if (!modalOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-in fade-in duration-300"
        onClick={handleBackdropClick}
      />

      {/* Modal container - adjusts size based on screen */}
      <div className="relative z-50 w-full max-w-md mx-auto my-4 sm:my-8">
        {/* Modal content */}
        <div
          ref={modalRef}
          className="bg-base-100 rounded-lg shadow-xl w-full transform transition-all animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] flex flex-col"
        >
          {/* Optional title and close button */}
          {(title || closeOnOutsideClick) && (
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-base-300">
              {title && (
                <h3
                  id="modal-title"
                  className="text-base sm:text-lg font-medium truncate pr-2"
                >
                  {title}
                </h3>
              )}
              <button
                className="p-2 rounded-full hover:bg-base-200 transition-colors flex-shrink-0"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Modal body - with overflow scrolling */}
          <div className="p-4 sm:p-6 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
