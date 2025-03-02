'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { ITodo, ITodoBase } from '@/types/todos';
import { Calendar as CalendarIcon, Loader2, Plus } from 'lucide-react';
import CalendarComponent from '@/components/calendar/Calendar';
import { AddTodo, TodoCard } from '@/components/todo';

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');

  const [todos, setTodos] = useState<ITodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use explicit YYYY-MM-DD string for selected date to avoid timezone issues
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    dateParam
      ? dateParam.split('T')[0]
      : new Date().toISOString().split('T')[0],
  );

  // Get a Date object from the string for display
  const selectedDate = new Date(`${selectedDateStr}T12:00:00Z`);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Update selected date when URL parameter changes
  useEffect(() => {
    if (dateParam) {
      setSelectedDateStr(dateParam.split('T')[0]);
    }
  }, [dateParam]);

  // Fetch todos for the selected date
  useEffect(() => {
    const fetchTodosForDate = async () => {
      setIsLoading(true);
      try {
        // Pass the exact selected date string to the API
        console.log(`Fetching todos for date: ${selectedDateStr}`);
        const response = await fetch(
          `/api/todos/by-date?date=${selectedDateStr}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch todos');
        }

        const data = await response.json();
        console.log(
          `Received ${data.length} todos for date ${selectedDateStr}`,
        );
        setTodos(data);
      } catch (error) {
        console.error('Error fetching todos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodosForDate();
  }, [selectedDateStr]);

  // Handle todo update
  const handleTodoUpdate = async (updatedTodo: ITodoBase) => {
    try {
      const response = await fetch(`/api/todos/${updatedTodo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTodo),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      // Refresh the todo list after updating
      const refreshResponse = await fetch(
        `/api/todos/by-date?date=${selectedDateStr}`,
      );
      if (refreshResponse.ok) {
        const freshData = await refreshResponse.json();
        setTodos(freshData);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  // Handle todo delete
  const handleTodoDelete = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      // Refresh the todo list after deletion
      const refreshResponse = await fetch(
        `/api/todos/by-date?date=${selectedDateStr}`,
      );
      if (refreshResponse.ok) {
        const freshData = await refreshResponse.json();
        setTodos(freshData);
      } else {
        // Fallback to filtering the current list if refresh fails
        setTodos(todos.filter((todo) => todo.id !== todoId));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // Handle new todo added
  // Handle new todo added
  const handleTodoAdded = () => {
    // Refresh the todo list to include the new todo
    const fetchTodosForDate = async () => {
      try {
        const response = await fetch(
          `/api/todos/by-date?date=${selectedDateStr}`,
        );
        if (response.ok) {
          const data = await response.json();
          setTodos(data);
        }
      } catch (error) {
        console.error('Error fetching todos after adding new one:', error);
      }
    };

    fetchTodosForDate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CalendarIcon className="text-primary" />
        Calendar View
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar column */}
        <div className="col-span-1">
          <CalendarComponent />
        </div>

        {/* Todos for selected date column */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-base-100 rounded-box p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Todos for {formatDate(selectedDate)}
              </h2>

              {/* Custom Add Todo Component with pre-filled date */}
              <div className="w-auto">
                <AddTodoButton
                  selectedDate={selectedDateStr}
                  onTodoAdded={handleTodoAdded}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : todos.length > 0 ? (
              <div className="space-y-4">
                {todos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onUpdate={handleTodoUpdate}
                    onDelete={handleTodoDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-base-content/70">
                <p className="text-lg font-medium">No todos for this day</p>
                <p className="mt-2">
                  Click the &quot;Add Todo&quot; button above to create a todo
                  for this day.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom AddTodo button that pre-fills the date
function AddTodoButton({
  selectedDate,
  onTodoAdded,
}: {
  selectedDate: string;
  onTodoAdded: (todo: ITodo) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="btn btn-primary btn-sm gap-1"
      >
        <Plus size={16} />
        Add Todo
      </button>

      {/* Only render AddTodo when the modal is open to ensure the date is current */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-transparent z-0"
          onClick={() => setModalOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <AddTodo
              onTodoAdded={onTodoAdded}
              initialDate={selectedDate}
              onClose={() => setModalOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
