'use client';

import { useEffect, useState } from 'react';

import TodoList from '@/components/todo/TodoList';
import EisenhowerMatrix from '@/components/EisenhowerMatrix';
import ClearTodos from '@/components/todo/ClearTodos';
import Toast from '@/components/ui/Toast';
import { ITodo } from '@/types/todos';
import { useToastStore } from '@/store/toastStore';
import { LayoutGrid, List, Calendar } from 'lucide-react';
import { sortTodosByPriority } from '@/utils/todoUtils';
import AddTodo from './AddTodo';
import Link from 'next/link';

interface IHomeComponentProps {
  initialTodos: ITodo[];
  isTodayView?: boolean;
}

const HomeComponent = ({
  initialTodos,
  isTodayView = true,
}: IHomeComponentProps) => {
  const [todos, setTodos] = useState<ITodo[]>(initialTodos);
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const { addToast } = useToastStore();

  useEffect(() => {
    const sortedTodos = sortTodosByPriority(initialTodos);
    setTodos(sortedTodos);
  }, [initialTodos]);

  const handleTodoAdded = (newTodo: ITodo) => {
    // For the general home page, always add the new todo
    setTodos((prev) => {
      return sortTodosByPriority([...prev, newTodo]);
    });
    addToast('Todo added successfully!', 'success');
  };

  const handleUpdateTodo = (updatedTodo: ITodo) => {
    // Check if this todo still meets the criteria for display on home page
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay();
    const dayMap = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
    };
    const todayDayOfWeek = dayMap[dayOfWeek as keyof typeof dayMap];

    // Check if the updated todo should still be displayed
    // Case 1: General task with no date/time info
    const isGeneralTask =
      !updatedTodo.dueDate &&
      !updatedTodo.nextOccurrence &&
      !updatedTodo.isRecurring;

    // Case 2: Task due today
    const isDueToday = updatedTodo.dueDate
      ? new Date(updatedTodo.dueDate).toISOString().split('T')[0] === todayStr
      : false;

    // Case 3: Recurring task with next occurrence today
    const hasOccurrenceToday = updatedTodo.nextOccurrence
      ? new Date(updatedTodo.nextOccurrence).toISOString().split('T')[0] ===
        todayStr
      : false;

    // Case 4: Weekly recurring task on today's day of week
    let matchesDayOfWeek = false;
    if (
      updatedTodo.isRecurring &&
      updatedTodo.recurrenceType === 'WEEKLY' &&
      updatedTodo.recurrenceDaysOfWeek
    ) {
      try {
        const daysOfWeek = JSON.parse(updatedTodo.recurrenceDaysOfWeek);
        matchesDayOfWeek = daysOfWeek.includes(todayDayOfWeek);
      } catch (e) {
        console.error('Error parsing recurrenceDaysOfWeek:', e);
      }
    }

    // Should the todo remain visible?
    const shouldRemainVisible =
      isGeneralTask || isDueToday || hasOccurrenceToday || matchesDayOfWeek;

    // Update or remove from state based on criteria
    setTodos((currentTodos) => {
      if (shouldRemainVisible) {
        // Update the todo in the list
        const updatedTodos = currentTodos.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo,
        );
        return sortTodosByPriority(updatedTodos);
      } else {
        // Remove the todo from the list
        const filteredTodos = currentTodos.filter(
          (todo) => todo.id !== updatedTodo.id,
        );
        return sortTodosByPriority(filteredTodos);
      }
    });
  };

  const handleDeleteTodo = (todoId: string) => {
    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== todoId),
    );
  };

  const handleClearCompleted = async () => {
    try {
      // Get IDs of completed todos in the current view
      const completedTodoIds = todos
        .filter((todo) => todo.completed)
        .map((todo) => todo.id);

      const response = await fetch('/api/todos/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'completed',
          todoIds: completedTodoIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear completed todos');
      }

      setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
      addToast('Completed todos cleared successfully', 'success');
    } catch (error) {
      console.error('Error clearing completed todos:', error);
      addToast('Failed to clear completed todos', 'error');
    }
  };

  const handleClearAll = async () => {
    try {
      // Get IDs of all todos in the current view
      const allTodoIds = todos.map((todo) => todo.id);

      const response = await fetch('/api/todos/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'specific',
          todoIds: allTodoIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear all todos');
      }

      setTodos([]);
      addToast('All todos cleared successfully', 'success');
    } catch (error) {
      console.error('Error clearing all todos:', error);
      addToast('Failed to clear all todos', 'error');
    }
  };

  const handleClearNonRecurring = async () => {
    try {
      // Get IDs of recurring todos in the current view
      const visibleTodoIds = todos.map((todo) => todo.id);
      const recurringTodoIds = todos
        .filter((todo) => todo.isRecurring)
        .map((todo) => todo.id);

      const response = await fetch('/api/todos/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'non-recurring-in-view',
          visibleTodoIds: visibleTodoIds,
          keepIds: recurringTodoIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear non-recurring todos');
      }

      // Update local state to keep only recurring todos
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.isRecurring));
      addToast('Non-recurring todos cleared successfully', 'success');
    } catch (error) {
      console.error('Error clearing non-recurring todos:', error);
      addToast('Failed to clear non-recurring todos', 'error');
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const recurringCount = todos.filter((todo) => todo.isRecurring).length;
  const totalCount = todos.length;

  // Format today's date for display
  const formatTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-base-100">
      <Toast />
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-base-200 shadow-lg mb-4 sm:mb-8 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
                    {isTodayView ? "Today's Tasks & General Todos" : 'My Todos'}
                  </h1>
                  {isTodayView && (
                    <p className="text-sm sm:text-base text-base-content/70 mt-1">
                      {formatTodayDate()}
                    </p>
                  )}
                </div>
                <Link href="/calendar" className="btn btn-sm btn-outline gap-1">
                  <Calendar size={16} />
                  <span className="hidden sm:inline">View Calendar</span>
                </Link>
              </div>

              <p className="text-sm sm:text-base text-base-content/70">
                Organize your tasks using the Eisenhower Matrix
              </p>
              <AddTodo onTodoAdded={handleTodoAdded} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 gap-3">
            <div className="join w-full sm:w-auto">
              <button
                className={`btn join-item gap-2 flex-1 sm:flex-none ${
                  viewMode === 'list' ? 'btn-active' : ''
                }`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
                List View
              </button>
              <button
                className={`btn join-item gap-2 flex-1 sm:flex-none ${
                  viewMode === 'matrix' ? 'btn-active' : ''
                }`}
                onClick={() => setViewMode('matrix')}
              >
                <LayoutGrid size={18} />
                Matrix View
              </button>
            </div>

            <ClearTodos
              onClearCompleted={handleClearCompleted}
              onClearAll={handleClearAll}
              onClearNonRecurring={handleClearNonRecurring}
              completedCount={completedCount}
              totalCount={totalCount}
              recurringCount={recurringCount}
              className="w-full sm:w-auto"
            />
          </div>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body p-3 sm:p-6">
              {todos.length === 0 ? (
                <div className="text-center py-4 sm:py-6">
                  <p className="text-base sm:text-lg opacity-70">
                    {isTodayView
                      ? 'No tasks for today or general todos. Add some tasks or check your calendar for upcoming tasks!'
                      : 'No todos yet. Add some tasks to get started!'}
                  </p>
                </div>
              ) : viewMode === 'list' ? (
                <TodoList
                  todos={todos}
                  onUpdateTodo={handleUpdateTodo}
                  onDeleteTodo={handleDeleteTodo}
                />
              ) : (
                <EisenhowerMatrix todos={todos} />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomeComponent;
