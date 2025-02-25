'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="card max-w-md bg-base-100 shadow-lg p-6">
        <div className="card-body text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-error" />
          </div>
          <h2 className="card-title text-2xl font-bold justify-center">
            Something went wrong!
          </h2>
          <p className="text-base-content/70 mb-6">
            We&apos;ve encountered an unexpected error. Please try again or
            contact support if the problem persists.
          </p>
          <div className="card-actions justify-center">
            <button className="btn btn-primary" onClick={() => reset()}>
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
