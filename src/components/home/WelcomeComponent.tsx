import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { CheckCircle } from 'lucide-react';

const WelcomeComponent = () => (
  <div className="hero min-h-[calc(100vh-4rem)] bg-base-200 px-4">
    <div className="hero-content text-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="p-3 sm:p-4 bg-primary rounded-full">
            <CheckCircle
              size={36}
              className="text-primary-content sm:h-12 sm:w-12"
            />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-base-content">
          Welcome to Todo Matrix
        </h1>
        <p className="py-4 sm:py-6 text-sm sm:text-base text-base-content/70">
          Organize your tasks effectively using the Eisenhower Matrix.
          Prioritize what&apos;s important, not just what&apos;s urgent.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div className="bg-accent bg-opacity-20 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-sm sm:text-base">
              Important & Urgent
            </h3>
            <p className="text-xs sm:text-sm opacity-70">
              Do these tasks immediately
            </p>
          </div>
          <div className="bg-primary bg-opacity-20 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-sm sm:text-base">
              Important & Not Urgent
            </h3>
            <p className="text-xs sm:text-sm opacity-70">
              Schedule these tasks
            </p>
          </div>
          <div className="bg-warning bg-opacity-20 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-sm sm:text-base">
              Not Important & Urgent
            </h3>
            <p className="text-xs sm:text-sm opacity-70">
              Delegate if possible
            </p>
          </div>
          <div className="bg-neutral bg-opacity-20 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-sm sm:text-base">
              Not Important & Not Urgent
            </h3>
            <p className="text-xs sm:text-sm opacity-70">
              Eliminate or do later
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center sm:space-x-4 space-y-3 sm:space-y-0">
          <SignInButton mode="modal">
            <button className="btn btn-primary w-full sm:w-auto">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn btn-outline w-full sm:w-auto">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  </div>
);

export default WelcomeComponent;
