'use client';

import { useState } from 'react';
import { AddTodo } from '@/components';
import TodoList from '@/components/todo/TodoList';
import { ITodo } from '@/types/todos';

interface IHomeComponentProps {
  initialTodos: ITodo[];
}

const HomeComponent = ({ initialTodos }: IHomeComponentProps) => {
  const [todos, setTodos] = useState<ITodo[]>(initialTodos);

  const handleTodoAdded = (newTodo: ITodo) => {
    setTodos((currentTodos) => [newTodo, ...currentTodos]);
  };

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

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <TodoList todos={todos} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomeComponent;
