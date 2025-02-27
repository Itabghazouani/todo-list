import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

const WelcomeComponent = () => (
  <div className="hero min-h-[calc(100vh-4rem)] bg-base-200 px-4">
    <div className="hero-content text-center">
      <div className="max-w-md">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary rounded-full">
            <CheckCircle size={48} className="text-primary-content" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-base-content">
          Welcome to Todo Matrix
        </h1>
        <p className="py-6 text-base-content/70">
          Organize your tasks effectively using the Eisenhower Matrix.
          Prioritize what&apos;s important, not just what&apos;s urgent.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-accent bg-opacity-20 p-4 rounded-lg">
            <h3 className="font-bold">Important & Urgent</h3>
            <p className="text-sm opacity-70">Do these tasks immediately</p>
          </div>
          <div className="bg-primary bg-opacity-20 p-4 rounded-lg">
            <h3 className="font-bold">Important & Not Urgent</h3>
            <p className="text-sm opacity-70">Schedule these tasks</p>
          </div>
          <div className="bg-warning bg-opacity-20 p-4 rounded-lg">
            <h3 className="font-bold">Not Important & Urgent</h3>
            <p className="text-sm opacity-70">Delegate if possible</p>
          </div>
          <div className="bg-neutral bg-opacity-20 p-4 rounded-lg">
            <h3 className="font-bold">Not Important & Not Urgent</h3>
            <p className="text-sm opacity-70">Eliminate or do later</p>
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/sign-in" className="btn btn-primary btn-lg">
            Sign In
          </Link>
          <Link href="/sign-up" className="btn btn-outline btn-lg">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default WelcomeComponent;
