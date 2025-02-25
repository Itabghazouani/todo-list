import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullPage?: boolean;
}

const LoadingSpinner = ({
  size = 24,
  className = '',
  fullPage = false,
}: LoadingSpinnerProps) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-base-100 bg-opacity-50 flex items-center justify-center z-50">
        <Loader2 className={`animate-spin ${className}`} size={size} />
      </div>
    );
  }

  return <Loader2 className={`animate-spin ${className}`} size={size} />;
};

export default LoadingSpinner;
