'use client';

import { AlertTriangle } from 'lucide-react';

interface ErrorComponentProps {
  error: Error;
}

const ErrorComponent = ({ error }: ErrorComponentProps) => (
  <div className="hero min-h-[calc(100vh-4rem)] bg-base-200 px-4">
    <div className="hero-content text-center p-0 sm:p-6">
      <div className="w-full max-w-md">
        <div className="alert alert-error shadow-lg p-4 sm:p-6">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Something went wrong
              </h1>
              <p className="opacity-70 mt-1 text-sm sm:text-base">
                {error.message || 'Please try again later'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary mt-4 sm:mt-6 w-full sm:w-auto"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

export default ErrorComponent;
