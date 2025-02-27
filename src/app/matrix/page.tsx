'use client';

import React from 'react';
import { CheckCircle, Clock, UserPlus, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import eisenhowerImage from '../../../public/eisenhower.jpg';

const MatrixExplanationPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center py-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-base-content">
            The Eisenhower Matrix
          </h1>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            A powerful approach to prioritize your tasks and manage your time
            effectively
          </p>
        </div>

        <section className="prose prose-lg max-w-none">
          <h2>What is the Eisenhower Matrix?</h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div>
              <p>
                The Eisenhower Matrix, also known as the Urgent-Important
                Matrix, is a time management tool that helps individuals and
                teams prioritize tasks based on their urgency and importance. It
                was inspired by Dwight D. Eisenhower, the 34th President of the
                United States, who was known for his exceptional ability to make
                decisions and manage time effectively.
              </p>
              <p>
                The matrix divides tasks into four quadrants, helping users
                focus on what truly matters while eliminating unnecessary
                distractions.
              </p>
            </div>
            <div className="md:w-1/3 shrink-0">
              <div className="relative aspect-square w-full bg-base-200 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                <Image
                  src={eisenhowerImage}
                  alt="President Dwight D. Eisenhower"
                  className="object-cover"
                  width={300}
                  height={300}
                  priority
                />
                <div className="absolute bottom-0 w-full bg-base-300 bg-opacity-80 p-2 text-center text-xs">
                  President Dwight D. Eisenhower
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="prose prose-lg max-w-none">
          <h2>How Does the Eisenhower Matrix Work?</h2>
          <p>
            The matrix is structured into four quadrants, each representing a
            different type of task based on its urgency and importance:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 not-prose">
            <div className="card bg-red-50 border border-red-200 shadow-sm">
              <div className="card-body">
                <h3 className="text-xl font-bold flex items-center gap-2 text-red-800">
                  <CheckCircle className="h-6 w-6" />
                  Urgent & Important (Do It Now)
                </h3>
                <p className="text-gray-900">
                  Tasks in this quadrant require immediate attention and have
                  significant consequences if not completed. These are
                  high-priority tasks that must be addressed as soon as
                  possible.
                </p>
                <div className="bg-white rounded-lg p-4 mt-2 text-gray-900">
                  <h4 className="font-medium mb-2">Examples:</h4>
                  <ul className="list-disc list-inside text-gray-900/80 space-y-1">
                    <li>Meeting a deadline for a work project</li>
                    <li>Handling a personal emergency</li>
                    <li>Responding to a critical client request</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card bg-blue-50 border border-blue-200 shadow-sm">
              <div className="card-body">
                <h3 className="text-xl font-bold flex items-center gap-2 text-blue-700">
                  <Clock className="h-6 w-6" />
                  Important but Not Urgent (Schedule It)
                </h3>
                <p className="text-gray-900">
                  Tasks in this category contribute to long-term goals and
                  overall success but do not require immediate action.
                  Scheduling these tasks ensures they are completed before they
                  become urgent.
                </p>
                <div className="bg-white rounded-lg p-4 mt-2">
                  <h4 className="font-medium mb-2">Examples:</h4>
                  <ul className="list-disc list-inside text-gray-900/80 space-y-1">
                    <li>Strategic planning for a business</li>
                    <li>Learning new skills or professional development</li>
                    <li>Exercising and maintaining personal health</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card bg-yellow-50 border border-yellow-200 shadow-sm">
              <div className="card-body">
                <h3 className="text-xl font-bold flex items-center gap-2 text-yellow-600">
                  <UserPlus className="h-6 w-6" />
                  Urgent but Not Important (Delegate It)
                </h3>
                <p className="text-gray-900">
                  These tasks demand immediate attention but do not
                  significantly contribute to long-term goals. Delegating these
                  tasks to someone else can free up time for more important
                  work.
                </p>
                <div className="bg-white rounded-lg p-4 mt-2">
                  <h4 className="font-medium mb-2">Examples:</h4>
                  <ul className="list-disc list-inside text-gray-900/80 space-y-1">
                    <li>Answering non-essential emails or phone calls</li>
                    <li>Scheduling routine meetings</li>
                    <li>Managing minor administrative tasks</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card bg-gray-50 border border-gray-200 shadow-sm">
              <div className="card-body">
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-600">
                  <Trash2 className="h-6 w-6" />
                  Neither Urgent nor Important (Eliminate It)
                </h3>
                <p className="text-gray-900">
                  Tasks in this quadrant are distractions that provide little to
                  no value. Eliminating or reducing time spent on these
                  activities helps increase productivity.
                </p>
                <div className="bg-white rounded-lg p-4 mt-2">
                  <h4 className="font-medium mb-2">Examples:</h4>
                  <ul className="list-disc list-inside text-gray-900/80 space-y-1">
                    <li>Scrolling endlessly on social media</li>
                    <li>Watching excessive amounts of TV</li>
                    <li>Engaging in unproductive gossip</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="prose prose-lg max-w-none">
          <h2>The Benefits of Using the Eisenhower Matrix</h2>
          <p>
            Implementing the Eisenhower Matrix in your to-do list offers
            numerous advantages:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
            <div className="card bg-base-100 shadow-sm hover:shadow transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary">
                  Improved Productivity
                </h3>
                <p>
                  By focusing on important tasks, you avoid wasting time on
                  low-value activities that don&apos;t contribute to your goals.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm hover:shadow transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary">
                  Better Decision-Making
                </h3>
                <p>
                  The matrix helps you assess priorities objectively, reducing
                  stress and last-minute rushes to complete work.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm hover:shadow transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary">
                  Enhanced Time Management
                </h3>
                <p>
                  Properly categorizing tasks ensures that urgent matters are
                  addressed while long-term goals are steadily pursued.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm hover:shadow transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary">Reduced Overwhelm</h3>
                <p>
                  Breaking tasks into categories prevents feeling overwhelmed by
                  an endless list of things to do.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="prose prose-lg max-w-none">
          <h2>How to Use the Eisenhower Matrix in Daily Life</h2>

          <div className="not-prose flex flex-col md:flex-row gap-8 items-start my-8">
            <div className="flex-1 space-y-6">
              <div className="flex gap-4 items-start">
                <div className="badge badge-lg badge-primary">1</div>
                <div>
                  <h3 className="text-lg font-medium">List all tasks</h3>
                  <p className="text-base-content/70">
                    Write down everything you need to do without filtering.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="badge badge-lg badge-primary">2</div>
                <div>
                  <h3 className="text-lg font-medium">Categorize each task</h3>
                  <p className="text-base-content/70">
                    Place each task into one of the four quadrants based on
                    urgency and importance.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="badge badge-lg badge-primary">3</div>
                <div>
                  <h3 className="text-lg font-medium">Act accordingly</h3>
                  <p className="text-base-content/70">
                    Complete urgent and important tasks, schedule important
                    ones, delegate when possible, and eliminate unnecessary
                    activities.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="badge badge-lg badge-primary">4</div>
                <div>
                  <h3 className="text-lg font-medium">Review and adjust</h3>
                  <p className="text-base-content/70">
                    Regularly assess and update your task list to maintain
                    productivity.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:w-1/3 shrink-0">
              <div className="bg-base-200 p-6 rounded-lg shadow-inner">
                <h3 className="font-bold text-lg mb-4">Pro Tips</h3>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <span>Start small with just a few tasks</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <span>Be honest about a task&apos;s true importance</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <span>Review your matrix at the start of each day</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <span>Adjust as needed when priorities shift</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <span>
                      Be willing to eliminate tasks that don&apos;t serve you
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-base-200 p-8 rounded-lg">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-semibold">Conclusion</h2>
            <p>
              The Eisenhower Matrix is a simple yet effective way to organize
              tasks and focus on what truly matters. Whether you are managing
              personal responsibilities, work projects, or daily to-do lists,
              applying this method can significantly improve productivity and
              reduce stress.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <Link href="/" className="btn btn-primary btn-lg gap-2">
              <span>Start Using the Matrix Now</span>
              <ArrowRight size={18} />
            </Link>
            <p className="mt-4 text-base-content/70 text-center">
              Take control of your time like never before!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MatrixExplanationPage;
