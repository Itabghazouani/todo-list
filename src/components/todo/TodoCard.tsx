'use client';

import { useState } from 'react';
import {
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  Save,
  X,
  ChevronRight,
  ChevronDown,
  RepeatIcon,
  ListTodo,
  Link,
} from 'lucide-react';
import Modal from '../Modal';
import {
  CATEGORIES,
  CATEGORY_STYLES,
  PRIORITIES,
  PRIORITY_STYLES,
} from '@/constants';
import { ITodoBase, ITodo, RecurrenceType } from '@/types/todos';
import { useToastStore } from '@/store/toastStore';
import LoadingButton from '../ui/LoadingButton';
import ConfirmDialog from '../ui/ConfirmDialog';
import SubtaskManager from './SubtaskManager';
import TaskDependencyManager from './TaskDependencyManager';
import RecurringTaskSettings from './RecurringTaskSettings';
import { formatRecurrencePattern } from '@/utils/recurrenceUtils';

interface IExtendedTodo extends ITodoBase {
  dependsOn?: Array<{
    dependsOnTodoId: string;
    dependsOnTodo?: {
      completed?: boolean;
    };
  }>;
}

interface ITodoCardProps {
  todo: ITodoBase;
  onUpdate?: (todo: ITodoBase) => void;
  onDelete?: (id: string) => void;
  isPreview?: boolean;
  isLoading?: boolean;
  isSubtaskView?: boolean;
}

export const TodoCard = ({
  todo,
  onUpdate,
  onDelete,
  isPreview = false,
  isLoading = false,
  isSubtaskView = false,
}: ITodoCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTodoData, setEditTodoData] = useState(todo);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editedDesc, setEditedDesc] = useState(todo.desc);
  const [expanded, setExpanded] = useState(false);
  const [subtasks, setSubtasks] = useState<ITodo[]>([]);

  const { addToast } = useToastStore();

  const isParentTask = !todo.isSubtask;

  const extendedTodo = todo as IExtendedTodo;

  const hasDependencies =
    extendedTodo.dependsOn && extendedTodo.dependsOn.length > 0;
  const hasUncompletedDependencies = hasDependencies
    ? extendedTodo.dependsOn?.some((d) => !d.dependsOnTodo?.completed)
    : false;

  const handleCompletionToggle = () => {
    if (isPreview || !onUpdate || isLoading) return;

    if (!todo.completed && hasUncompletedDependencies) {
      addToast(
        'Cannot complete: This task depends on other uncompleted tasks',
        'warning',
      );
      return;
    }

    const allSubtasksCompleted =
      subtasks.length === 0 || subtasks.every((subtask) => subtask.completed);

    if (!todo.completed && subtasks.length > 0 && !allSubtasksCompleted) {
      addToast('Consider completing all subtasks first', 'info');
    }

    onUpdate({
      ...todo,
      completed: !todo.completed,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview || !onUpdate || isLoading) return;

    if (!editTodoData.desc.trim()) {
      addToast('Task description cannot be empty', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToUpdate = {
        ...editTodoData,
        isRecurring: editTodoData.isRecurring || false,
        recurrenceType: editTodoData.isRecurring
          ? editTodoData.recurrenceType
          : null,
        recurrenceInterval: editTodoData.isRecurring
          ? editTodoData.recurrenceInterval
          : null,
        recurrenceEndDate: editTodoData.isRecurring
          ? editTodoData.recurrenceEndDate
          : null,
      };
      onUpdate(dataToUpdate);
      setIsEditModalOpen(false);
      addToast('Task updated successfully', 'success');
    } catch (error) {
      console.error('Failed to edit todo:', error);
      addToast('Failed to update task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (isPreview || !onDelete || isLoading) return;

    onDelete(todo.id);
    setShowDeleteConfirm(false);
  };

  const handleSaveInlineEdit = () => {
    if (!editedDesc.trim()) {
      addToast('Task description cannot be empty', 'warning');
      return;
    }

    if (onUpdate) {
      onUpdate({
        ...todo,
        desc: editedDesc,
      });
      setIsInlineEditing(false);
    }
  };

  const handleCancelInlineEdit = () => {
    setEditedDesc(todo.desc);
    setIsInlineEditing(false);
  };

  const openEditModal = () => {
    setEditTodoData({ ...todo });
    setIsEditModalOpen(true);
  };

  const handleRecurrenceChange = (recurrenceData: {
    isRecurring: boolean;
    recurrenceType?: RecurrenceType | null;
    recurrenceInterval?: number | null;
    recurrenceEndDate?: string | null;
  }) => {
    setEditTodoData({
      ...editTodoData,
      isRecurring: recurrenceData.isRecurring,
      recurrenceType: recurrenceData.recurrenceType as
        | RecurrenceType
        | undefined,
      recurrenceInterval: recurrenceData.recurrenceInterval,
      recurrenceEndDate: recurrenceData.recurrenceEndDate,
    });
  };

  const handleSubtasksChange = (updatedSubtasks: ITodo[]) => {
    setSubtasks(updatedSubtasks);
  };

  const recurrencePattern = todo.isRecurring
    ? formatRecurrencePattern(
        todo.recurrenceType as RecurrenceType,
        todo.recurrenceInterval,
      )
    : null;

  const subtaskCount = subtasks.length;
  const completedSubtaskCount = subtasks.filter((st) => st.completed).length;
  const hasSubtasks = subtaskCount > 0;

  return (
    <>
      <div
        className={`card bg-base-100 shadow-sm transition-opacity ${
          isLoading ? 'opacity-70' : ''
        }`}
      >
        <div className="card-body p-4">
          <div className="flex items-start gap-3">
            {isParentTask && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="p-1 hover:bg-base-200 rounded-md transition-colors mt-0.5"
                aria-label={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleCompletionToggle}
              className="p-1 hover:bg-base-200 rounded-md transition-colors"
              disabled={isPreview || isLoading}
              aria-label={
                todo.completed ? 'Mark as incomplete' : 'Mark as complete'
              }
            >
              {todo.completed ? (
                <CheckCircle size={20} className="text-success" />
              ) : (
                <Circle size={20} />
              )}
            </button>

            <div className="flex-1">
              {isInlineEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedDesc}
                    onChange={(e) => setEditedDesc(e.target.value)}
                    className="input input-bordered w-full"
                    autoFocus
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveInlineEdit();
                      if (e.key === 'Escape') handleCancelInlineEdit();
                    }}
                  />
                  <button
                    onClick={handleSaveInlineEdit}
                    className="btn btn-circle btn-sm btn-success"
                    disabled={isLoading || !editedDesc.trim()}
                  >
                    <Save size={14} />
                  </button>
                  <button
                    onClick={handleCancelInlineEdit}
                    className="btn btn-circle btn-sm btn-ghost"
                    disabled={isLoading}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div>
                  <p
                    className={`text-base-content ${
                      todo.completed ? 'line-through opacity-50' : ''
                    }`}
                  >
                    {todo.desc}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {todo.isRecurring && (
                      <div className="badge badge-sm gap-1 badge-outline">
                        <RepeatIcon size={12} />
                        <span className="text-xs">{recurrencePattern}</span>
                      </div>
                    )}

                    {hasSubtasks && (
                      <div className="badge badge-sm gap-1 badge-outline">
                        <ListTodo size={12} />
                        <span className="text-xs">
                          {completedSubtaskCount}/{subtaskCount}
                        </span>
                      </div>
                    )}

                    {hasDependencies && (
                      <div
                        className={`badge badge-sm gap-1 ${
                          hasUncompletedDependencies
                            ? 'badge-warning'
                            : 'badge-outline'
                        }`}
                      >
                        <Link size={12} />
                        <span className="text-xs">Dependencies</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-2">
                <div
                  className={`badge ${
                    CATEGORY_STYLES[todo.category]
                  } min-w-[100px] justify-center`}
                >
                  {CATEGORIES[todo.category]}
                </div>
                <div
                  className={`badge ${
                    PRIORITY_STYLES[todo.priority]
                  } min-w-[200px] justify-center text-sm`}
                >
                  {PRIORITIES[todo.priority]}
                </div>
              </div>
            </div>

            {!isPreview && !isInlineEditing && (
              <div className="flex gap-1">
                <button
                  onClick={() => setIsInlineEditing(true)}
                  className="p-1 rounded-md hover:bg-base-200 transition-colors tooltip tooltip-left"
                  data-tip="Quick edit title"
                  disabled={isLoading || todo.completed}
                  aria-label="Quick edit title"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={openEditModal}
                  className="p-1 rounded-md hover:bg-base-200 transition-colors tooltip tooltip-left"
                  data-tip="Edit all details"
                  disabled={isLoading}
                  aria-label="Edit details"
                >
                  <Edit size={16} className="text-primary" />
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1 rounded-md hover:bg-base-200 transition-colors text-error tooltip tooltip-left"
                  data-tip="Delete task"
                  disabled={isLoading}
                  aria-label="Delete todo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {expanded && isParentTask && !isSubtaskView && (
            <div className="mt-3 pl-8">
              <div key={`subtasks-${todo.id}`}>
                <SubtaskManager
                  todoId={todo.id}
                  isCompleted={todo.completed}
                  onSubtasksChange={handleSubtasksChange}
                />
              </div>

              <div key={`dependencies-${todo.id}`}>
                <TaskDependencyManager
                  todoId={todo.id}
                  isCompleted={todo.completed}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal modalOpen={isEditModalOpen} setModalOpen={setIsEditModalOpen}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <h3 className="font-bold text-lg text-base-content">Edit Task</h3>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <input
              type="text"
              value={editTodoData.desc}
              onChange={(e) =>
                setEditTodoData({ ...editTodoData, desc: e.target.value })
              }
              className="input input-bordered w-full"
              placeholder="Task description"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <div
                  key={key}
                  className={`cursor-pointer ${CATEGORY_STYLES[key]} ${
                    editTodoData.category === key
                      ? 'ring-2 ring-primary'
                      : 'opacity-70 hover:opacity-100'
                  } px-3 py-2 rounded-full transition-all text-sm`}
                  onClick={() =>
                    !isSubmitting &&
                    setEditTodoData({
                      ...editTodoData,
                      category: key as ITodoBase['category'],
                    })
                  }
                >
                  {value}
                </div>
              ))}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Priority</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRIORITIES).map(([key, value]) => (
                <div
                  key={key}
                  className={`cursor-pointer border ${
                    editTodoData.priority === key
                      ? 'border-primary shadow-sm'
                      : 'border-base-300'
                  } rounded-md p-2 transition-colors hover:bg-base-200`}
                  onClick={() =>
                    !isSubmitting &&
                    setEditTodoData({
                      ...editTodoData,
                      priority: key as ITodoBase['priority'],
                    })
                  }
                >
                  <div
                    className={`badge ${PRIORITY_STYLES[key]} badge-sm p-2.5`}
                  >
                    {value}
                  </div>
                  <div className="text-xs mt-2 text-base-content/70">
                    {key === 'IMPORTANT_URGENT'
                      ? 'Do immediately'
                      : key === 'IMPORTANT_NOT_URGENT'
                      ? 'Schedule time for it'
                      : key === 'NOT_IMPORTANT_URGENT'
                      ? 'Delegate if possible'
                      : 'Eliminate or do later'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!todo.isSubtask && <div className="divider">Advanced Options</div>}

          {!todo.isSubtask && (
            <RecurringTaskSettings
              isRecurring={editTodoData.isRecurring || false}
              recurrenceType={editTodoData.recurrenceType}
              recurrenceInterval={editTodoData.recurrenceInterval}
              recurrenceEndDate={editTodoData.recurrenceEndDate}
              onRecurrenceChange={handleRecurrenceChange}
              disabled={isSubmitting}
            />
          )}

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={editTodoData.completed}
                onChange={(e) =>
                  setEditTodoData({
                    ...editTodoData,
                    completed: e.target.checked,
                  })
                }
                disabled={isSubmitting}
              />
              <span className="label-text">Completed</span>
            </label>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              className="btn-primary"
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              Save Changes
            </LoadingButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={
          subtaskCount > 0
            ? `This task has ${subtaskCount} subtask${
                subtaskCount === 1 ? '' : 's'
              } that will also be deleted. This action cannot be undone.`
            : 'Are you sure you want to delete this task? This action cannot be undone.'
        }
        confirmText="Delete"
        confirmButtonClass="btn-error"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
