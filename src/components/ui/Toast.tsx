'use client';

import { useToastStore } from '@/store/toastStore';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const Toast = () => {
  const { toasts, removeToast } = useToastStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getAlertClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'info':
        return 'alert-info';
      case 'warning':
        return 'alert-warning';
      default:
        return '';
    }
  };

  return (
    <div className="toast toast-top toast-end z-50 p-2 max-w-[90vw] sm:max-w-md md:max-w-lg">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert ${getAlertClass(
            toast.type,
          )} shadow-lg mb-2 text-sm sm:text-base`}
        >
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2 break-words">
              {getIcon(toast.type)}
              <span className="line-clamp-3">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="btn btn-ghost btn-xs ml-2 flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
