'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { InfoIcon, Filter, XCircle } from 'lucide-react';
import { ITodo, ITodoBase } from '@/types/todos';
import { TodoCard } from './TodoCard';
import SearchAndFilterBar from './SearchAndFilterBar';
import { useToastStore } from '@/store/toastStore';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ITodoListProps {
  todos: ITodo[];
  onUpdateTodo: (updatedTodo: ITodo) => void;
  onDeleteTodo: (todoId: string) => void;
}

const TodoList = ({ todos, onUpdateTodo, onDeleteTodo }: ITodoListProps) => {
  // Filter out subtasks from the main todos array first
  const mainTodos = useMemo(
    () => todos.filter((todo) => !todo.isSubtask),
    [todos],
  );

  const [filteredTodos, setFilteredTodos] = useState<ITodo[]>(mainTodos);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { addToast } = useToastStore();

  const hasActiveFilters =
    searchTerm || categoryFilter || priorityFilter || !showCompleted;

  const applyFilters = useCallback(() => {
    let result = [...mainTodos]; // Use mainTodos instead of all todos

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
  }, [mainTodos, searchTerm, categoryFilter, priorityFilter, showCompleted]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setPriorityFilter(null);
    setShowCompleted(true);
    addToast('Filters cleared', 'info');
  };

  const updateTodoInDatabase = async (updatedTodo: ITodo) => {
    setIsLoading((prev) => ({ ...prev, [updatedTodo.id]: true }));

    try {
      const response = await fetch(`/api/todos/${updatedTodo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      });

      if (!response.ok) throw new Error('Failed to update todo');

      // Get the updated todo from the response
      const serverUpdatedTodo = await response.json();

      // Call the parent's update function
      onUpdateTodo(serverUpdatedTodo);

      addToast('Task updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update todo:', error);
      addToast('Failed to update task', 'error');
    } finally {
      setIsLoading((prev) => ({ ...prev, [updatedTodo.id]: false }));
    }
  };

  const handleCardUpdate = (baseTodo: ITodoBase) => {
    const existingTodo = todos.find((t) => t.id === baseTodo.id);
    if (!existingTodo) return;

    // Make sure to include all properties from both objects
    const fullTodo: ITodo = {
      ...existingTodo,
      ...baseTodo,
      createdAt: existingTodo.createdAt,
      userId: existingTodo.userId,
    };

    updateTodoInDatabase(fullTodo);
  };

  const handleTodoDelete = async (todoId: string) => {
    setIsLoading((prev) => ({ ...prev, [todoId]: true }));

    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete todo');

      // Call the parent's delete function
      onDeleteTodo(todoId);

      addToast('Task deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete todo:', error);
      addToast('Failed to delete task', 'error');
    } finally {
      setIsLoading((prev) => ({ ...prev, [todoId]: false }));
    }
  };

  // Update stats to use mainTodos instead of all todos
  const stats = (
    <div className="flex overflow-x-auto hide-scrollbar mb-6 w-full">
      <div className="stats shadow w-full min-w-0 flex-shrink">
        <div className="stat px-3 sm:px-6">
          <div className="stat-title text-xs sm:text-sm whitespace-nowrap">
            Total Tasks
          </div>
          <div className="stat-value text-primary text-xl sm:text-3xl">
            {mainTodos.length}
          </div>
        </div>
        <div className="stat px-3 sm:px-6">
          <div className="stat-title text-xs sm:text-sm whitespace-nowrap">
            Completed
          </div>
          <div className="stat-value text-success text-xl sm:text-3xl">
            {mainTodos.filter((todo) => todo.completed).length}
          </div>
        </div>
        <div className="stat px-3 sm:px-6">
          <div className="stat-title text-xs sm:text-sm whitespace-nowrap">
            Pending
          </div>
          <div className="stat-value text-warning text-xl sm:text-3xl">
            {mainTodos.filter((todo) => !todo.completed).length}
          </div>
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
        initialSearchTerm={searchTerm}
        initialCategoryFilter={categoryFilter}
        initialPriorityFilter={priorityFilter}
        initialShowCompleted={showCompleted}
      />

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between mb-4 mt-2 gap-2">
          <div className="badge badge-outline gap-1">
            <Filter size={14} />
            <span>Filters applied</span>
          </div>
          <button
            onClick={clearFilters}
            className="btn btn-xs btn-ghost text-error gap-1"
          >
            <XCircle size={14} />
            Clear all filters
          </button>
        </div>
      )}

      <div className="divide-y divide-base-300">
        {filteredTodos.map((todo) => (
          <div
            key={todo.id}
            className="py-3 sm:py-4 first:pt-0 last:pb-0 relative"
          >
            {isLoading[todo.id] && (
              <div className="absolute inset-0 bg-base-200 bg-opacity-50 flex items-center justify-center z-10">
                <LoadingSpinner size={24} />
              </div>
            )}
            <TodoCard
              todo={todo}
              onUpdate={handleCardUpdate}
              onDelete={handleTodoDelete}
              isLoading={!!isLoading[todo.id]}
            />
          </div>
        ))}
      </div>

      {filteredTodos.length === 0 && (
        <div className="alert alert-info flex-col sm:flex-row items-start sm:items-center text-left">
          <InfoIcon className="stroke-current shrink-0 w-6 h-6 mt-1 sm:mt-0" />
          <div>
            {mainTodos.length === 0 ? (
              <>
                <h3 className="font-bold">No tasks yet</h3>
                <div className="text-xs">
                  Add your first task to get started!
                </div>
              </>
            ) : (
              <>
                <h3 className="font-bold">No matching tasks</h3>
                <div className="text-xs">
                  {hasActiveFilters
                    ? 'Try adjusting your filters'
                    : 'Try adding some tasks'}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
