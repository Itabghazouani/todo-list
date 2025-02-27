'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PlusCircle, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { ITodo, ITodoBase } from '@/types/todos';
import { useToastStore } from '@/store/toastStore';
import { TodoCard } from './TodoCard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface SubtaskManagerProps {
  todoId: string;
  isCompleted: boolean;
  onSubtasksChange?: (subtasks: ITodo[]) => void;
}

const SubtaskManager = ({
  todoId,
  isCompleted,
  onSubtasksChange,
}: SubtaskManagerProps) => {
  const [subtasks, setSubtasks] = useState<ITodo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskDesc, setNewSubtaskDesc] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const { addToast } = useToastStore();

  // Use a ref instead of state to track if we've fetched data
  // This won't trigger re-renders when it changes
  const hasFetchedRef = useRef(false);
  // Track the current todoId to detect changes
  const previousTodoIdRef = useRef(todoId);

  const fetchSubtasks = useCallback(
    async (force = false) => {
      // Skip if we've already fetched for this todoId and not forcing a refresh
      if (
        hasFetchedRef.current &&
        !force &&
        previousTodoIdRef.current === todoId
      ) {
        return;
      }

      // Update refs
      previousTodoIdRef.current = todoId;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/todos/${todoId}/subtasks`);
        if (!response.ok) {
          throw new Error('Failed to fetch subtasks');
        }
        const data = await response.json();
        setSubtasks(data);

        // Only notify parent if the data has actually changed
        if (JSON.stringify(data) !== JSON.stringify(subtasks)) {
          onSubtasksChange?.(data);
        }

        // Mark that we've fetched the data
        hasFetchedRef.current = true;
      } catch (error) {
        console.error('Error fetching subtasks:', error);
        addToast('Failed to load subtasks', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, onSubtasksChange, todoId, subtasks],
  );

  // Effect to handle initial fetch and todoId changes
  useEffect(() => {
    if (todoId) {
      // If todoId changed, reset our tracking and fetch data
      if (previousTodoIdRef.current !== todoId) {
        hasFetchedRef.current = false;
        fetchSubtasks();
      } else if (!hasFetchedRef.current) {
        // Initial fetch if needed
        fetchSubtasks();
      }
    }
  }, [todoId, fetchSubtasks]);

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSubtaskDesc.trim()) {
      addToast('Subtask description cannot be empty', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/todos/${todoId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          desc: newSubtaskDesc,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subtask');
      }

      const newSubtask = await response.json();
      const updatedSubtasks = [...subtasks, newSubtask];

      setSubtasks(updatedSubtasks);
      onSubtasksChange?.(updatedSubtasks);
      setNewSubtaskDesc('');
      setIsAddingSubtask(false);
      addToast('Subtask added successfully', 'success');
    } catch (error) {
      console.error('Error adding subtask:', error);
      addToast('Failed to add subtask', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubtaskUpdate = async (updatedSubtask: ITodoBase) => {
    try {
      const response = await fetch(`/api/todos/${updatedSubtask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSubtask),
      });

      if (!response.ok) {
        throw new Error('Failed to update subtask');
      }

      const updated = await response.json();
      const updatedSubtasks = subtasks.map((st) =>
        st.id === updated.id ? updated : st,
      );

      setSubtasks(updatedSubtasks);
      onSubtasksChange?.(updatedSubtasks);
      addToast('Subtask updated successfully', 'success');
    } catch (error) {
      console.error('Error updating subtask:', error);
      addToast('Failed to update subtask', 'error');
    }
  };

  const handleSubtaskDelete = async (subtaskId: string) => {
    try {
      const response = await fetch(`/api/todos/${subtaskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subtask');
      }

      const updatedSubtasks = subtasks.filter((st) => st.id !== subtaskId);
      setSubtasks(updatedSubtasks);
      onSubtasksChange?.(updatedSubtasks);
      addToast('Subtask deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting subtask:', error);
      addToast('Failed to delete subtask', 'error');
    }
  };

  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const progressPercentage =
    totalSubtasks > 0
      ? Math.round((completedSubtasks / totalSubtasks) * 100)
      : 0;

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
            Subtasks ({completedSubtasks}/{totalSubtasks})
          </span>
        </button>

        {!isCompleted && (
          <button
            onClick={() => setIsAddingSubtask(!isAddingSubtask)}
            className="btn btn-xs btn-ghost h-7 min-h-0"
            disabled={isLoading}
          >
            <PlusCircle size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="text-xs">Add subtask</span>
          </button>
        )}
      </div>

      {totalSubtasks > 0 && (
        <div className="w-full bg-base-300 rounded-full h-1.5 sm:h-2.5 mb-2 sm:mb-3">
          <div
            className="bg-primary h-1.5 sm:h-2.5 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-2">
          {isAddingSubtask && (
            <form
              onSubmit={handleAddSubtask}
              className="flex gap-1 sm:gap-2 mb-2 sm:mb-3"
            >
              <input
                type="text"
                value={newSubtaskDesc}
                onChange={(e) => setNewSubtaskDesc(e.target.value)}
                className="input input-bordered input-xs sm:input-sm flex-grow text-xs sm:text-sm"
                placeholder="Add a subtask..."
                disabled={isLoading}
                autoFocus
              />
              <div className="flex gap-1">
                <button
                  type="submit"
                  className="btn btn-xs sm:btn-sm btn-primary btn-square"
                  disabled={isLoading || !newSubtaskDesc.trim()}
                >
                  <Save size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-xs sm:btn-sm btn-ghost btn-square"
                  onClick={() => setIsAddingSubtask(false)}
                  disabled={isLoading}
                >
                  <X size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </form>
          )}

          {isLoading && subtasks.length === 0 ? (
            <div className="flex justify-center p-2 sm:p-4">
              <LoadingSpinner size={20} />
            </div>
          ) : subtasks.length === 0 ? (
            <div className="text-center text-base-content/70 py-1 sm:py-2 text-xs sm:text-sm">
              No subtasks yet. Add some to break down this task.
            </div>
          ) : (
            <div className="space-y-1 sm:space-y-2">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="pl-2 sm:pl-3 border-l-2 border-base-300"
                >
                  <TodoCard
                    todo={subtask}
                    onUpdate={handleSubtaskUpdate}
                    onDelete={handleSubtaskDelete}
                    isLoading={isLoading}
                    isSubtaskView={true} // Add this prop to prevent nested SubtaskManagers
                    hideCategory={true}
                    hidePriority={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubtaskManager;
