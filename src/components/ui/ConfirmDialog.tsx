'use client';

import { useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'btn-error',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle z-50"
      onClose={onCancel}
    >
      <div className="modal-box max-w-xs sm:max-w-md mx-auto">
        <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span className="break-words">{title}</span>
        </h3>
        <p className="py-3 sm:py-4 text-sm sm:text-base">{message}</p>
        <div className="modal-action flex flex-row gap-2 mt-4">
          <button
            className={`btn btn-sm sm:btn-md flex-1 ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button className="btn btn-sm sm:btn-md flex-1" onClick={onCancel}>
            {cancelText}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button
          className="absolute inset-0 w-full h-full cursor-default"
          onClick={onCancel}
          aria-label="Close dialog"
        >
          close
        </button>
      </form>
    </dialog>
  );
};

export default ConfirmDialog;
