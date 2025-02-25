'use client';

import { useEffect, useState } from 'react';
import { InfoIcon } from 'lucide-react';
import { ITodo, ITodoBase } from '@/types/todos';
import { TodoCard } from './TodoCard';
import SearchAndFilterBar from './SearchAndFilterBar';

interface ITodoListProps {
  todos: ITodo[];
}

const TodoList = ({ todos: initialTodos }: ITodoListProps) => {
  const [todos, setTodos] = useState<ITodo[]>(initialTodos);
  const [filteredTodos, setFilteredTodos] = useState<ITodo[]>(initialTodos);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  useEffect(() => {
    let result = [...todos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((todo) => todo.desc.toLowerCase().includes(term));
    }

    if (categoryFilter) {
      result = result.filter((todo) => todo.category === categoryFilter);
    }

    if (priorityFilter) {
      result = result.filter((todo) => todo.priority === priorityFilter);
    }

    if (!showCompleted) {
      result = result.filter((todo) => !todo.completed);
    }

    setFilteredTodos(result);
  }, [todos, searchTerm, categoryFilter, priorityFilter, showCompleted]);

  const updateTodoInDatabase = async (updatedTodo: ITodo) => {
    try {
      const response = await fetch(`/api/todos/${updatedTodo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      });

      if (!response.ok) throw new Error('Failed to update todo');

      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo,
        ),
      );
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleCardUpdate = (baseTodo: ITodoBase) => {
    const existingTodo = todos.find((t) => t.id === baseTodo.id);
    if (!existingTodo) return;

    const fullTodo: ITodo = {
      ...baseTodo,
      createdAt: existingTodo.createdAt,
      userId: existingTodo.userId,
    };

    updateTodoInDatabase(fullTodo);
  };

  const handleTodoDelete = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete todo');

      setTodos((currentTodos) =>
        currentTodos.filter((todo) => todo.id !== todoId),
      );
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const stats = (
    <div className="stats shadow w-full mb-6">
      <div className="stat">
        <div className="stat-title">Total Tasks</div>
        <div className="stat-value text-primary">{todos.length}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Completed</div>
        <div className="stat-value text-success">
          {todos.filter((todo) => todo.completed).length}
        </div>
      </div>
      <div className="stat">
        <div className="stat-title">Pending</div>
        <div className="stat-value text-warning">
          {todos.filter((todo) => !todo.completed).length}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {stats}

      <SearchAndFilterBar
        onSearch={setSearchTerm}
        onCategoryFilter={setCategoryFilter}
        onPriorityFilter={setPriorityFilter}
        onCompletedFilter={setShowCompleted}
      />

      <div className="divide-y divide-base-300">
        {filteredTodos.map((todo) => (
          <div key={todo.id} className="py-4 first:pt-0 last:pb-0">
            <TodoCard
              todo={todo}
              onUpdate={handleCardUpdate}
              onDelete={handleTodoDelete}
            />
          </div>
        ))}
      </div>

      {filteredTodos.length === 0 && (
        <div className="alert alert-info">
          <InfoIcon className="stroke-current shrink-0 w-6 h-6" />
          <div>
            {todos.length === 0 ? (
              <>
                <h3 className="font-bold">No tasks yet</h3>
                <div className="text-xs">
                  Add your first task to get started!
                </div>
              </>
            ) : (
              <>
                <h3 className="font-bold">No matching tasks</h3>
                <div className="text-xs">Try adjusting your filters</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
