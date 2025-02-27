'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { ITodo, IDependency } from '@/types/todos';
import { useToastStore } from '@/store/toastStore';
import LoadingSpinner from '../ui/LoadingSpinner';

interface TaskDependencyManagerProps {
  todoId: string;
  isCompleted: boolean;
}

const TaskDependencyManager = ({
  todoId,
  isCompleted,
}: TaskDependencyManagerProps) => {
  const [dependencies, setDependencies] = useState<IDependency[]>([]);
  const [availableTasks, setAvailableTasks] = useState<ITodo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingDependency, setIsAddingDependency] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const { addToast } = useToastStore();

  const fetchDependencies = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/todos/${todoId}/dependencies`);
      if (!response.ok) {
        throw new Error('Failed to fetch dependencies');
      }

      const data = await response.json();
      setDependencies(data.dependencies || []);
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      addToast('Failed to load dependencies', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [todoId, addToast]);

  useEffect(() => {
    if (todoId) {
      fetchDependencies();
    }
  }, [todoId, fetchDependencies]);

  const fetchAvailableTasks = async () => {
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const allTasks = await response.json();

      const dependencyIds = dependencies.map((dep) => dep.dependsOnTodoId);
      const filteredTasks = allTasks.filter(
        (task: ITodo) =>
          task.id !== todoId &&
          !task.isSubtask &&
          !dependencyIds.includes(task.id),
      );

      setAvailableTasks(filteredTasks);
    } catch (error) {
      console.error('Error fetching available tasks:', error);
      addToast('Failed to load available tasks', 'error');
    }
  };

  const handleAddDependencyClick = () => {
    setIsAddingDependency(true);
    fetchAvailableTasks();
    setSelectedTaskId('');
  };

  const handleAddDependency = async () => {
    if (!selectedTaskId) {
      addToast('Please select a task', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/todos/${todoId}/dependencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dependsOnTodoId: selectedTaskId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add dependency');
      }

      const newDependency = await response.json();
      console.log('New dependency:', newDependency);
      setDependencies([...dependencies, newDependency]);
      setIsAddingDependency(false);
      addToast('Dependency added successfully', 'success');
    } catch (error) {
      console.error('Error adding dependency:', error);
      addToast(
        error instanceof Error ? error.message : 'Failed to add dependency',
        'error',
      );
    } finally {
      setIsLoading(false);
    }
  };

  console.log('Dependencies before mapping:', dependencies);

  const handleRemoveDependency = async (dependsOnTodoId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/todos/${todoId}/dependencies?dependsOnTodoId=${dependsOnTodoId}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to remove dependency');
      }

      setDependencies(
        dependencies.filter((dep) => dep.dependsOnTodoId !== dependsOnTodoId),
      );
      addToast('Dependency removed successfully', 'success');
    } catch (error) {
      console.error('Error removing dependency:', error);
      addToast('Failed to remove dependency', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-3 bg-base-200 rounded-lg p-2 sm:p-3">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        <button
          className="flex items-center gap-1 text-xs sm:text-sm font-medium"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp size={14} className="sm:w-4 sm:h-4" />
          ) : (
            <ChevronDown size={14} className="sm:w-4 sm:h-4" />
          )}
          <span className="whitespace-nowrap">
            Dependencies ({dependencies.length})
          </span>
        </button>

        {!isCompleted && (
          <button
            onClick={handleAddDependencyClick}
            className="btn btn-xs btn-ghost h-7 min-h-0"
            disabled={isLoading || isAddingDependency}
          >
            <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="text-xs">Add dependency</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-2 sm:space-y-3">
          {isAddingDependency && (
            <div className="flex flex-col gap-1 sm:gap-2 p-1.5 sm:p-2 bg-base-300 rounded-md">
              <div className="text-xs sm:text-sm font-medium">
                Select a task that must be completed before this one:
              </div>

              <select
                className="select select-bordered select-xs sm:select-sm w-full text-xs sm:text-sm"
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select a task...</option>
                {availableTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.desc} {task.completed ? '(Completed)' : ''}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-1 sm:gap-2 mt-1">
                <button
                  className="btn btn-xs sm:btn-sm btn-ghost text-xs sm:text-sm"
                  onClick={() => setIsAddingDependency(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-xs sm:btn-sm btn-primary text-xs sm:text-sm"
                  onClick={handleAddDependency}
                  disabled={isLoading || !selectedTaskId}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {isLoading && dependencies.length === 0 ? (
            <div className="flex justify-center p-2 sm:p-4">
              <LoadingSpinner size={20} />
            </div>
          ) : dependencies.length === 0 ? (
            <div className="text-center text-base-content/70 py-1 sm:py-2 text-xs sm:text-sm">
              {isAddingDependency
                ? 'Select a task from the dropdown above.'
                : 'No dependencies yet. Add tasks that must be completed before this one.'}
            </div>
          ) : (
            <div className="space-y-1 sm:space-y-2">
              {dependencies.map((dependency) => (
                <div
                  key={dependency.id}
                  className="flex justify-between items-center p-1.5 sm:p-2 bg-base-100 rounded-md"
                >
                  <div className="flex items-center gap-1 sm:gap-2 flex-grow min-w-0">
                    {dependency.dependsOnTodo?.completed ? (
                      <CheckCircle2
                        size={14}
                        className="sm:w-4 sm:h-4 text-success flex-shrink-0"
                      />
                    ) : (
                      <Circle
                        size={14}
                        className="sm:w-4 sm:h-4 flex-shrink-0"
                      />
                    )}
                    <span
                      className={`text-xs sm:text-sm truncate ${
                        dependency.dependsOnTodo?.completed
                          ? 'line-through opacity-70'
                          : ''
                      }`}
                    >
                      {dependency.dependsOnTodo?.desc || 'Unknown task'}
                    </span>
                  </div>

                  {!isCompleted && (
                    <button
                      className="btn btn-xs btn-ghost text-error flex-shrink-0 h-6 min-h-0 w-6 p-0"
                      onClick={() =>
                        handleRemoveDependency(dependency.dependsOnTodoId)
                      }
                      disabled={isLoading}
                      aria-label="Remove dependency"
                    >
                      <X size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDependencyManager;
