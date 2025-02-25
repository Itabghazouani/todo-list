import { ButtonHTMLAttributes } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

const LoadingButton = ({
  isLoading,
  children,
  loadingText,
  className = '',
  ...props
}: LoadingButtonProps) => {
  return (
    <button
      className={`btn ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size={16} />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
