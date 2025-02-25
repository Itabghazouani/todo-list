'use client';

import { useEffect, useState } from 'react';
import { AddTodo } from '@/components';
import TodoList from '@/components/todo/TodoList';
import EisenhowerMatrix from '@/components/EisenhowerMatrix';
import { ITodo } from '@/types/todos';
import { PRIORITIES, PRIORITY_ORDER } from '@/constants';
import ClearTodos from './ClearTodos';

interface IHomeComponentProps {
  initialTodos: ITodo[];
}

const HomeComponent = ({ initialTodos }: IHomeComponentProps) => {
  const [todos, setTodos] = useState<ITodo[]>(initialTodos);
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');

  const sortTodosByPriority = (todosToSort: ITodo[]): ITodo[] => {
    return [...todosToSort].sort((a, b) => {
      const priorityAValue = PRIORITIES[a.priority];
      const priorityBValue = PRIORITIES[b.priority];

      return PRIORITY_ORDER[priorityAValue] - PRIORITY_ORDER[priorityBValue];
    });
  };

  useEffect(() => {
    const sortedTodos = sortTodosByPriority(initialTodos);
    setTodos(sortedTodos);
  }, [initialTodos]);

  const handleTodoAdded = (newTodo: ITodo) => {
    setTodos((prev) => {
      return sortTodosByPriority([...prev, newTodo]);
    });
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
    } catch (error) {
      console.error('Error clearing completed todos:', error);
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
    } catch (error) {
      console.error('Error clearing all todos:', error);
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-base-100">
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

          <div className="flex justify-between items-center mb-4">
            <div className="join">
              <button
                className={`btn join-item ${
                  viewMode === 'list' ? 'btn-active' : ''
                }`}
                onClick={() => setViewMode('list')}
              >
                List View
              </button>
              <button
                className={`btn join-item ${
                  viewMode === 'matrix' ? 'btn-active' : ''
                }`}
                onClick={() => setViewMode('matrix')}
              >
                Matrix View
              </button>
            </div>

            <ClearTodos
              onClearCompleted={handleClearCompleted}
              onClearAll={handleClearAll}
              completedCount={completedCount}
              totalCount={todos.length}
            />
          </div>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              {viewMode === 'list' ? (
                <TodoList todos={todos} />
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
