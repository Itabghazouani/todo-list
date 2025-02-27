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
    <div className="mt-3 bg-base-200 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <button
          className="flex items-center gap-1 text-sm font-medium"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Dependencies ({dependencies.length})
        </button>

        {!isCompleted && (
          <button
            onClick={handleAddDependencyClick}
            className="btn btn-xs btn-ghost"
            disabled={isLoading || isAddingDependency}
          >
            <Plus size={14} />
            Add dependency
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {isAddingDependency && (
            <div className="flex flex-col gap-2 p-2 bg-base-300 rounded-md">
              <div className="text-sm font-medium">
                Select a task that must be completed before this one:
              </div>

              <select
                className="select select-bordered select-sm w-full"
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

              <div className="flex justify-end gap-2 mt-1">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setIsAddingDependency(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleAddDependency}
                  disabled={isLoading || !selectedTaskId}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {isLoading && dependencies.length === 0 ? (
            <div className="flex justify-center p-4">
              <LoadingSpinner size={24} />
            </div>
          ) : dependencies.length === 0 ? (
            <div className="text-center text-base-content/70 py-2 text-sm">
              {isAddingDependency
                ? 'Select a task from the dropdown above.'
                : 'No dependencies yet. Add tasks that must be completed before this one.'}
            </div>
          ) : (
            <div className="space-y-2">
              {dependencies.map((dependency) => (
                <div
                  key={dependency.id}
                  className="flex justify-between items-center p-2 bg-base-100 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    {dependency.dependsOnTodo?.completed ? (
                      <CheckCircle2 size={16} className="text-success" />
                    ) : (
                      <Circle size={16} />
                    )}
                    <span
                      className={
                        dependency.dependsOnTodo?.completed
                          ? 'line-through opacity-70'
                          : ''
                      }
                    >
                      {dependency.dependsOnTodo?.desc || 'Unknown task'}
                    </span>
                  </div>

                  {!isCompleted && (
                    <button
                      className="btn btn-xs btn-ghost text-error"
                      onClick={() =>
                        handleRemoveDependency(dependency.dependsOnTodoId)
                      }
                      disabled={isLoading}
                    >
                      <X size={14} />
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
