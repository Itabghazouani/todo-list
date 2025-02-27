'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  Award,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { ITodo } from '@/types/todos';
import { PRIORITIES, CATEGORIES } from '@/constants';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface UserDashboardProps {
  todos: ITodo[];
  loading?: boolean;
}

const UserDashboard = ({ todos, loading = false }: UserDashboardProps) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'completion' | 'trends'
  >('overview');

  if (!loading && (!todos || todos.length === 0)) {
    return (
      <div className="bg-base-200 rounded-xl p-8 text-center">
        <div className="max-w-md mx-auto">
          <Activity className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
          <h3 className="text-xl font-bold mb-2">No data to analyze yet</h3>
          <p className="text-base-content/70 mb-6">
            Start adding tasks to see productivity insights and analytics.
          </p>
          <button className="btn btn-primary">Add Your First Task</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-base-200 rounded-xl p-16 flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  const completedTodos = todos.filter((todo) => todo.completed);
  const completionRate = Math.round(
    (completedTodos.length / todos.length) * 100,
  );

  const priorityData = Object.keys(PRIORITIES).map((priority) => {
    const count = todos.filter((todo) => todo.priority === priority).length;
    return {
      name: PRIORITIES[priority as keyof typeof PRIORITIES].split(' - ')[0],
      value: count,
      priority,
    };
  });

  const completionByPriority = Object.keys(PRIORITIES).map((priority) => {
    const totalInPriority = todos.filter(
      (todo) => todo.priority === priority,
    ).length;
    const completedInPriority = todos.filter(
      (todo) => todo.priority === priority && todo.completed,
    ).length;
    const rate = totalInPriority
      ? Math.round((completedInPriority / totalInPriority) * 100)
      : 0;

    return {
      name: PRIORITIES[priority as keyof typeof PRIORITIES].split(' - ')[0],
      completion: rate,
      count: totalInPriority,
    };
  });

  const completionByCategory = Object.keys(CATEGORIES).map((category) => {
    const totalInCategory = todos.filter(
      (todo) => todo.category === category,
    ).length;
    const completedInCategory = todos.filter(
      (todo) => todo.category === category && todo.completed,
    ).length;

    return {
      name: CATEGORIES[category as keyof typeof CATEGORIES],
      total: totalInCategory,
      completed: completedInCategory,
    };
  });

  const PRIORITY_COLORS = {
    IMPORTANT_URGENT: '#B91C1C', // red-800
    IMPORTANT_NOT_URGENT: '#1D4ED8', // blue-700
    NOT_IMPORTANT_URGENT: '#CA8A04', // yellow-600
    NOT_IMPORTANT_NOT_URGENT: '#6B7280', // gray-500
  };

  const trendData = [
    { day: 'Mon', tasks: 4, completed: 3 },
    { day: 'Tue', tasks: 6, completed: 4 },
    { day: 'Wed', tasks: 5, completed: 3 },
    { day: 'Thu', tasks: 7, completed: 5 },
    { day: 'Fri', tasks: 8, completed: 6 },
    { day: 'Sat', tasks: 3, completed: 2 },
    { day: 'Sun', tasks: 2, completed: 1 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-3 sm:p-4">
            <div className="flex justify-between items-center">
              <h3 className="card-title text-base sm:text-lg">Total Tasks</h3>
              <div className="badge badge-primary badge-md sm:badge-lg">
                {todos.length}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs sm:text-sm">
              <div className="text-base-content/70">
                Active: {todos.length - completedTodos.length}
              </div>
              <div className="text-base-content/70">
                Done: {completedTodos.length}
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-3 sm:p-4">
            <div className="flex justify-between items-center">
              <h3 className="card-title text-base sm:text-lg">
                Completion Rate
              </h3>
              <div
                className={`badge badge-md sm:badge-lg ${
                  completionRate > 50 ? 'badge-success' : 'badge-warning'
                }`}
              >
                {completionRate}%
              </div>
            </div>
            <progress
              className={`progress w-full mt-2 ${
                completionRate > 50 ? 'progress-success' : 'progress-warning'
              }`}
              value={completionRate}
              max="100"
            ></progress>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-3 sm:p-4">
            <div className="flex justify-between items-center">
              <h3 className="card-title text-base sm:text-lg">
                Priority Focus
              </h3>
              <div className="badge badge-accent badge-md sm:badge-lg text-xs">
                {priorityData.sort((a, b) => b.value - a.value)[0]?.name ||
                  'None'}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-base-content/70">
                Most common priority quadrant
              </span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-3 sm:p-4">
            <div className="flex justify-between items-center">
              <h3 className="card-title text-base sm:text-lg">
                Productivity Score
              </h3>
              <div className="badge badge-info badge-md sm:badge-lg">
                {Math.min(
                  100,
                  Math.round(
                    completionRate * 0.5 +
                      completedTodos.filter(
                        (t) =>
                          t.priority === 'IMPORTANT_URGENT' ||
                          t.priority === 'IMPORTANT_NOT_URGENT',
                      ).length *
                        10,
                  ),
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm">
              <Award className="w-4 h-4 text-info" />
              <span className="text-base-content/70">
                Based on completion & priorities
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs tabs-boxed bg-base-200 p-1 overflow-x-auto flex-nowrap">
        <button
          className={`tab text-xs sm:text-sm ${
            activeTab === 'overview' ? 'tab-active' : ''
          }`}
          onClick={() => setActiveTab('overview')}
        >
          <PieChartIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Overview
        </button>
        <button
          className={`tab text-xs sm:text-sm ${
            activeTab === 'completion' ? 'tab-active' : ''
          }`}
          onClick={() => setActiveTab('completion')}
        >
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Completion
        </button>
        <button
          className={`tab text-xs sm:text-sm ${
            activeTab === 'trends' ? 'tab-active' : ''
          }`}
          onClick={() => setActiveTab('trends')}
        >
          <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Trends
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-3 sm:p-6">
              <h3 className="card-title text-base sm:text-lg">
                Task Distribution by Priority
              </h3>
              <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {priorityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            PRIORITY_COLORS[
                              entry.priority as keyof typeof PRIORITY_COLORS
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {priorityData.map((entry) => (
                  <div
                    key={entry.priority}
                    className="flex items-center gap-1 sm:gap-2"
                  >
                    <div
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                      style={{
                        backgroundColor:
                          PRIORITY_COLORS[
                            entry.priority as keyof typeof PRIORITY_COLORS
                          ],
                      }}
                    ></div>
                    <span className="text-xs truncate">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-3 sm:p-6">
              <h3 className="card-title text-base sm:text-lg">
                Completion by Priority
              </h3>
              <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={completionByPriority}
                    margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar
                      dataKey="completion"
                      name="Completion Rate (%)"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'completion' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-3 sm:p-6">
              <h3 className="card-title text-base sm:text-lg">
                Completion by Category
              </h3>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={completionByCategory}
                    margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      domain={[0, 'dataMax']}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar
                      dataKey="total"
                      name="Total Tasks"
                      stackId="a"
                      fill="#8884d8"
                    />
                    <Bar
                      dataKey="completed"
                      name="Completed"
                      stackId="a"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-3 sm:p-6">
              <h3 className="card-title text-base sm:text-lg">
                Task Status Analysis
              </h3>
              <div className="stats stats-vertical shadow w-full text-xs sm:text-sm">
                <div className="stat p-2 sm:p-4">
                  <div className="stat-title text-xs sm:text-sm">
                    High Priority Completion
                  </div>
                  <div className="stat-value text-primary text-xl sm:text-2xl">
                    {Math.round(
                      (todos.filter(
                        (t) => t.priority === 'IMPORTANT_URGENT' && t.completed,
                      ).length /
                        Math.max(
                          1,
                          todos.filter((t) => t.priority === 'IMPORTANT_URGENT')
                            .length,
                        )) *
                        100,
                    )}
                    %
                  </div>
                  <div className="stat-desc text-xs">
                    Important + Urgent tasks
                  </div>
                </div>

                <div className="stat p-2 sm:p-4">
                  <div className="stat-title text-xs sm:text-sm">
                    Strategic Work
                  </div>
                  <div className="stat-value text-secondary text-xl sm:text-2xl">
                    {Math.round(
                      (todos.filter(
                        (t) => t.priority === 'IMPORTANT_NOT_URGENT',
                      ).length /
                        todos.length) *
                        100,
                    )}
                    %
                  </div>
                  <div className="stat-desc text-xs">
                    Important + Not Urgent tasks
                  </div>
                </div>

                <div className="stat p-2 sm:p-4">
                  <div className="stat-title text-xs sm:text-sm">
                    Potential Delegation
                  </div>
                  <div className="stat-value text-xl sm:text-2xl">
                    {
                      todos.filter((t) => t.priority === 'NOT_IMPORTANT_URGENT')
                        .length
                    }
                  </div>
                  <div className="stat-desc text-xs">
                    Tasks you might delegate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
                <h3 className="card-title text-base sm:text-lg">
                  Weekly Activity
                </h3>
                <div className="join self-start sm:self-auto">
                  <button
                    className={`join-item btn btn-xs ${
                      timeRange === 'week' ? 'btn-active' : ''
                    }`}
                    onClick={() => setTimeRange('week')}
                  >
                    Week
                  </button>
                  <button
                    className={`join-item btn btn-xs ${
                      timeRange === 'month' ? 'btn-active' : ''
                    }`}
                    onClick={() => setTimeRange('month')}
                  >
                    Month
                  </button>
                  <button
                    className={`join-item btn btn-xs ${
                      timeRange === 'all' ? 'btn-active' : ''
                    }`}
                    onClick={() => setTimeRange('all')}
                  >
                    All
                  </button>
                </div>
              </div>

              <div className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="tasks"
                      name="Total Tasks"
                      stroke="#8884d8"
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Completed Tasks"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-200 rounded-lg">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
                  <div>
                    <div className="text-base sm:text-lg font-bold">24</div>
                    <div className="text-xs text-base-content/70">
                      Tasks completed this week
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-200 rounded-lg">
                  <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-error" />
                  <div>
                    <div className="text-base sm:text-lg font-bold">5</div>
                    <div className="text-xs text-base-content/70">
                      Overdue tasks
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-200 rounded-lg">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-info" />
                  <div>
                    <div className="text-base sm:text-lg font-bold">15%</div>
                    <div className="text-xs text-base-content/70">
                      Productivity increase
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card bg-primary bg-opacity-10 text-primary-content shadow-sm">
        <div className="card-body p-3 sm:p-6">
          <h3 className="card-title text-primary text-base sm:text-lg">
            Productivity Insights
          </h3>
          <div className="space-y-2 text-xs sm:text-sm">
            <p className="text-base-content/70">
              {completionRate > 70
                ? "You're doing great at completing tasks! Keep up the good work."
                : completionRate > 40
                ? "You're making steady progress. Try to focus more on your important tasks."
                : 'Your completion rate is low. Try breaking down big tasks into smaller ones.'}
            </p>

            {(priorityData.find((p) => p.priority === 'IMPORTANT_URGENT')
              ?.value ?? 0) >
              (priorityData.find((p) => p.priority === 'IMPORTANT_NOT_URGENT')
                ?.value || 0) && (
              <p className="text-base-content/80">
                You have more urgent & important tasks than scheduled important
                work. Try to plan ahead to reduce urgency.
              </p>
            )}

            {(priorityData.find((p) => p.priority === 'NOT_IMPORTANT_URGENT')
              ?.value ?? 0) >
              (priorityData.find((p) => p.priority === 'IMPORTANT_NOT_URGENT')
                ?.value || 0) && (
              <p className="text-base-content/80">
                You&apos;re spending more time on urgent but unimportant tasks
                than strategic work. Consider delegating these tasks when
                possible.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
