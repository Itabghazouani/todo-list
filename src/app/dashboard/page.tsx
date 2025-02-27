'use client';

import { useState, useEffect } from 'react';
import { ITodo } from '@/types/todos';
import { Calendar, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { UserDashboard } from '@/components/user';

const DashboardPage = () => {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'all'>(
    'week',
  );

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/todos');

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Server responded with ${response.status}`,
          );
        }

        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error('Error fetching todos:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load your task data',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  if (!loading && (!todos || todos.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center p-8 bg-base-200 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">No tasks found</h2>
          <p className="mb-6">
            Start by adding some tasks to see your productivity dashboard.
          </p>
          <Link href="/" className="btn btn-primary">
            Go to Home page
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="alert alert-error shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Error</h3>
              <div className="text-xs">{error}</div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-5xl">
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
              Your Productivity Dashboard
            </h1>
            <p className="text-sm sm:text-base text-base-content/70 mt-1">
              Track your progress and gain insights into your task management
            </p>
          </div>

          <div className="join w-full md:w-auto grid grid-cols-3 sm:flex mt-3 md:mt-0">
            <button
              className={`join-item btn btn-sm sm:btn-md ${
                timePeriod === 'week' ? 'btn-active' : ''
              }`}
              onClick={() => setTimePeriod('week')}
            >
              Week
            </button>
            <button
              className={`join-item btn btn-sm sm:btn-md ${
                timePeriod === 'month' ? 'btn-active' : ''
              }`}
              onClick={() => setTimePeriod('month')}
            >
              Month
            </button>
            <button
              className={`join-item btn btn-sm sm:btn-md ${
                timePeriod === 'all' ? 'btn-active' : ''
              }`}
              onClick={() => setTimePeriod('all')}
            >
              All
            </button>
          </div>
        </div>

        {!loading && todos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="stat bg-base-100 shadow-sm rounded-box p-3 sm:p-4">
              <div className="stat-figure text-primary">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="stat-title text-xs sm:text-sm">
                Most Productive Day
              </div>
              <div className="stat-value text-primary text-xl sm:text-2xl md:text-3xl">
                Tuesday
              </div>
              <div className="stat-desc text-xs">
                You complete 35% more tasks
              </div>
            </div>

            <div className="stat bg-base-100 shadow-sm rounded-box p-3 sm:p-4">
              <div className="stat-figure text-secondary">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="stat-title text-xs sm:text-sm">
                Average Completion Time
              </div>
              <div className="stat-value text-secondary text-xl sm:text-2xl md:text-3xl">
                2.5 days
              </div>
              <div className="stat-desc text-xs">
                From creation to completion
              </div>
            </div>

            <div className="stat bg-base-100 shadow-sm rounded-box p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
              <div className="stat-figure text-accent">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="stat-title text-xs sm:text-sm">Focus Trend</div>
              <div className="stat-value text-accent text-xl sm:text-2xl md:text-3xl">
                ↗︎ 14%
              </div>
              <div className="stat-desc text-xs">
                More important tasks completed
              </div>
            </div>
          </div>
        )}

        <div className="bg-base-100 rounded-box shadow-sm p-3 sm:p-4">
          <UserDashboard todos={todos} loading={loading} />
        </div>

        <div className="card bg-base-200">
          <div className="card-body p-4 sm:p-6">
            <h2 className="card-title text-lg sm:text-xl">
              Want to improve your productivity?
            </h2>
            <p className="text-sm sm:text-base">
              Learn more about the Eisenhower Matrix method and how it can help
              you prioritize effectively.
            </p>
            <div className="card-actions justify-end mt-2">
              <Link href="/matrix" className="btn btn-sm sm:btn-md btn-primary">
                Learn More
                <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
