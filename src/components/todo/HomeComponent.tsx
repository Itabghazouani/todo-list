'use client';

import { useEffect, useState } from 'react';

import TodoList from '@/components/todo/TodoList';
import EisenhowerMatrix from '@/components/EisenhowerMatrix';
import ClearTodos from '@/components/todo/ClearTodos';
import Toast from '@/components/ui/Toast';
import { ITodo } from '@/types/todos';
import { useToastStore } from '@/store/toastStore';
import { LayoutGrid, List } from 'lucide-react';
import { sortTodosByPriority } from '@/utils/todoUtils';
import AddTodo from './AddTodo';

interface IHomeComponentProps {
  initialTodos: ITodo[];
}

const HomeComponent = ({ initialTodos }: IHomeComponentProps) => {
  const [todos, setTodos] = useState<ITodo[]>(initialTodos);
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const { addToast } = useToastStore();

  useEffect(() => {
    const sortedTodos = sortTodosByPriority(initialTodos);
    setTodos(sortedTodos);
  }, [initialTodos]);

  const handleTodoAdded = (newTodo: ITodo) => {
    setTodos((prev) => {
      return sortTodosByPriority([...prev, newTodo]);
    });
    addToast('Todo added successfully!', 'success');
  };

  const handleUpdateTodo = (updatedTodo: ITodo) => {
    setTodos((currentTodos) => {
      const updatedTodos = currentTodos.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo,
      );
      return sortTodosByPriority(updatedTodos);
    });
  };

  const handleDeleteTodo = (todoId: string) => {
    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== todoId),
    );
  };

  const handleClearCompleted = async () => {
    try {
      const response = await fetch('/api/todos/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'completed' }),
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
      const response = await fetch('/api/todos/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'all' }),
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
      // Optionally, you could first fetch the latest todos from the server
      // to ensure you have the most up-to-date state
      const latestTodosResponse = await fetch('/api/todos');
      if (!latestTodosResponse.ok) {
        throw new Error('Failed to fetch latest todos');
      }
      const latestTodos = (await latestTodosResponse.json()) as ITodo[];

      // Now use the latest todos to determine which ones are recurring
      const recurringTodoIds = latestTodos
        .filter((todo) => todo.isRecurring)
        .map((todo) => todo.id);

      const response = await fetch('/api/todos/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'non-recurring',
          keepIds: recurringTodoIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear non-recurring todos');
      }

      // Update local state based on the recurring IDs from the server
      setTodos((prevTodos) =>
        prevTodos.filter((todo) => recurringTodoIds.includes(todo.id)),
      );

      addToast('Non-recurring todos cleared successfully', 'success');
    } catch (error) {
      console.error('Error clearing non-recurring todos:', error);
      addToast('Failed to clear non-recurring todos', 'error');
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const recurringCount = todos.filter((todo) => todo.isRecurring).length;
  const totalCount = todos.length;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-base-100">
      <Toast />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-base-200 shadow-lg mb-8 p-6">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold text-base-content">My Todos</h1>
              <p className="text-base-content/70">
                Organize your tasks using the Eisenhower Matrix
              </p>
              <AddTodo onTodoAdded={handleTodoAdded} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div className="join">
              <button
                className={`btn join-item gap-2 ${
                  viewMode === 'list' ? 'btn-active' : ''
                }`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
                List View
              </button>
              <button
                className={`btn join-item gap-2 ${
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
            />
          </div>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              {todos.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-lg opacity-70">
                    No todos yet. Add some tasks to get started!
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
