// src/components/home/ErrorComponent.tsx
'use client';

import { AlertTriangle } from 'lucide-react';

interface ErrorComponentProps {
  error: Error;
}

const ErrorComponent = ({ error }: ErrorComponentProps) => (
  <div className="hero min-h-[calc(100vh-4rem)] bg-base-200">
    <div className="hero-content text-center">
      <div className="max-w-md">
        <div className="alert alert-error shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <AlertTriangle className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="opacity-70">
                {error.message || 'Please try again later'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary mt-6"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

export default ErrorComponent;
