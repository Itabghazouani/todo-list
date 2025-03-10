'use client';

import { FormEvent, useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, Calendar, Clock } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import {
  CATEGORIES,
  CATEGORY_STYLES,
  PRIORITIES,
  PRIORITY_STYLES,
} from '@/constants';
import {
  TCategory,
  TPriority,
  ICreateTodoInput,
  ITodo,
  RecurrenceType,
} from '@/types/todos';
import Modal from '../Modal';
import LoadingButton from '../ui/LoadingButton';
import RecurringTaskSettings from './RecurringTaskSettings';

interface IAddTodoProps {
  onTodoAdded?: (newTodo: ITodo) => void;
  parentId?: string;
  initialDate?: string; // New prop for pre-filling date
  onClose?: () => void; // New prop for custom close handling
}

const AddTodo = ({
  onTodoAdded,
  parentId,
  initialDate,
  onClose,
}: IAddTodoProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState<
    ICreateTodoInput & {
      isRecurring: boolean;
      recurrenceType?: RecurrenceType;
      recurrenceInterval?: number;
      recurrenceEndDate?: string;
      recurrenceDaysOfWeek?: string | null;
      isSubtask?: boolean;
      parentId?: string;
      dueDate?: string | null;
      startTime?: string | null;
      endTime?: string | null;
    }
  >({
    desc: '',
    category: '' as TCategory,
    priority: '' as TPriority,
    isRecurring: false,
    isSubtask: !!parentId,
    parentId,
    dueDate: initialDate || null,
    startTime: null,
    endTime: null,
    recurrenceDaysOfWeek: null,
  });

  const { addToast } = useToastStore();

  // When initialDate changes, update the form data
  useEffect(() => {
    if (initialDate) {
      setFormData((prev) => ({
        ...prev,
        dueDate: initialDate,
      }));
    }
  }, [initialDate]);

  // Open modal automatically if initialDate is provided
  useEffect(() => {
    if (initialDate && !modalOpen) {
      setModalOpen(true);
    }
  }, [initialDate, modalOpen]);

  const resetForm = () => {
    setFormData({
      desc: '',
      category: '' as TCategory,
      priority: '' as TPriority,
      isRecurring: false,
      isSubtask: !!parentId,
      parentId,
      dueDate: initialDate || null,
      startTime: null,
      endTime: null,
      recurrenceDaysOfWeek: null,
    });
    setShowAdvanced(false);
  };

  const handleOpenModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const validateForm = (): boolean => {
    if (!formData.desc.trim()) {
      addToast('Please enter a task description', 'warning');
      return false;
    }
    if (!formData.category) {
      addToast('Please select a category', 'warning');
      return false;
    }
    if (!formData.priority) {
      addToast('Please select a priority', 'warning');
      return false;
    }

    if (formData.isRecurring) {
      if (!formData.recurrenceType) {
        addToast('Please select a recurrence pattern', 'warning');
        return false;
      }
      if (!formData.recurrenceInterval || formData.recurrenceInterval < 1) {
        addToast('Please enter a valid recurrence interval', 'warning');
        return false;
      }
      if (
        formData.isRecurring &&
        formData.recurrenceType === RecurrenceType.WEEKLY
      ) {
        if (
          !formData.recurrenceDaysOfWeek ||
          formData.recurrenceDaysOfWeek === '[]'
        ) {
          addToast(
            'Please select at least one day of the week for weekly recurrence',
            'warning',
          );
          return false;
        }
      }
    }

    // Time validation if both start and end times are specified
    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        addToast('End time must be after start time', 'warning');
        return false;
      }
    }

    return true;
  };

  const handleRecurrenceChange = (recurrenceData: {
    isRecurring: boolean;
    recurrenceType?: RecurrenceType | null;
    recurrenceInterval?: number | null;
    recurrenceEndDate?: string | null;
    recurrenceDaysOfWeek?: string | null;
  }) => {
    setFormData({
      ...formData,
      isRecurring: recurrenceData.isRecurring,
      recurrenceType: recurrenceData.recurrenceType || undefined,
      recurrenceInterval: recurrenceData.recurrenceInterval || undefined,
      recurrenceEndDate: recurrenceData.recurrenceEndDate || undefined,
      recurrenceDaysOfWeek: recurrenceData.recurrenceDaysOfWeek || null,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        isSubtask: !!parentId,
        parentId: parentId || undefined,
      };

      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('Failed to create todo');
      }

      const newTodo = await response.json();
      onTodoAdded?.(newTodo);

      addToast('Task created successfully!', 'success');
      resetForm();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to add todo:', error);
      addToast('Failed to add task. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If used with initialDate (from calendar), don't show the regular buttons
  if (initialDate && onClose) {
    return (
      <Modal
        modalOpen={modalOpen}
        setModalOpen={(open) => {
          setModalOpen(open);
          if (!open && onClose) onClose();
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <h3 className="font-bold text-lg text-base-content">
              Add Task for {initialDate}
            </h3>
            <p className="text-base-content/70 text-sm mt-1">
              Fill in the details to create a task for this date
            </p>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <input
              type="text"
              value={formData.desc}
              onChange={(e) =>
                setFormData({ ...formData, desc: e.target.value })
              }
              placeholder="What needs to be done?"
              className="input input-bordered w-full"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Date and Time Fields */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Due Date & Time</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/70">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dueDate: e.target.value || null,
                    })
                  }
                  className="input input-bordered pl-10 w-full"
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/70">
                    <Clock size={16} />
                  </span>
                  <input
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startTime: e.target.value || null,
                      })
                    }
                    className="input input-bordered pl-10 w-full"
                    placeholder="Start"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/70">
                    <Clock size={16} />
                  </span>
                  <input
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endTime: e.target.value || null,
                      })
                    }
                    className="input input-bordered pl-10 w-full"
                    placeholder="End"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <div
                  key={key}
                  className={`cursor-pointer ${CATEGORY_STYLES[key]} ${
                    formData.category === key
                      ? 'ring-2 ring-primary'
                      : 'opacity-70 hover:opacity-100'
                  } px-3 py-2 rounded-full transition-all text-sm`}
                  onClick={() =>
                    !isSubmitting &&
                    setFormData({
                      ...formData,
                      category: key as TCategory,
                    })
                  }
                >
                  {value}
                </div>
              ))}
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Priority</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(PRIORITIES).map(([key, value]) => (
                <div
                  key={key}
                  className={`cursor-pointer border ${
                    formData.priority === key
                      ? 'border-primary shadow-sm'
                      : 'border-base-300'
                  } rounded-md p-2 transition-colors hover:bg-base-200`}
                  onClick={() =>
                    !isSubmitting &&
                    setFormData({
                      ...formData,
                      priority: key as TPriority,
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

          <button
            type="button"
            className="btn btn-sm btn-ghost w-full"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? (
              <>
                <ChevronUp size={16} /> Hide advanced options
              </>
            ) : (
              <>
                <ChevronDown size={16} /> Show advanced options
              </>
            )}
          </button>

          {showAdvanced && (
            <div className="bg-base-200 p-4 rounded-lg">
              {!parentId && (
                <RecurringTaskSettings
                  isRecurring={formData.isRecurring}
                  recurrenceType={formData.recurrenceType}
                  recurrenceInterval={formData.recurrenceInterval}
                  recurrenceEndDate={formData.recurrenceEndDate}
                  recurrenceDaysOfWeek={formData.recurrenceDaysOfWeek}
                  onRecurrenceChange={handleRecurrenceChange}
                  disabled={isSubmitting}
                />
              )}
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              className="btn-primary"
              isLoading={isSubmitting}
              loadingText="Creating..."
            >
              Create Task
            </LoadingButton>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <div>
      {/* Desktop version - Full width button */}
      <button
        onClick={handleOpenModal}
        className="btn btn-primary w-full gap-2 hidden sm:flex justify-center"
      >
        {parentId ? 'Add subtask' : 'Add new task'}
        <Plus className="h-5 w-5" />
      </button>

      {/* Mobile version - Fixed button at bottom right */}
      <button
        onClick={handleOpenModal}
        className="btn btn-primary btn-circle shadow-lg fixed bottom-8 right-8 z-10 sm:hidden"
        aria-label={parentId ? 'Add subtask' : 'Add new task'}
      >
        <Plus className="h-6 w-6" />
      </button>

      <Modal modalOpen={modalOpen} setModalOpen={setModalOpen}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <h3 className="font-bold text-lg text-base-content">
              {parentId ? 'Add subtask' : 'Add new task'}
            </h3>
            <p className="text-base-content/70 text-sm mt-1">
              Fill in the details to create a{' '}
              {parentId ? 'subtask' : 'new task'}
            </p>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <input
              type="text"
              value={formData.desc}
              onChange={(e) =>
                setFormData({ ...formData, desc: e.target.value })
              }
              placeholder="What needs to be done?"
              className="input input-bordered w-full"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Date and Time Fields */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Due Date & Time</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/70">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dueDate: e.target.value || null,
                    })
                  }
                  className="input input-bordered pl-10 w-full"
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/70">
                    <Clock size={16} />
                  </span>
                  <input
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startTime: e.target.value || null,
                      })
                    }
                    className="input input-bordered pl-10 w-full"
                    placeholder="Start"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/70">
                    <Clock size={16} />
                  </span>
                  <input
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endTime: e.target.value || null,
                      })
                    }
                    className="input input-bordered pl-10 w-full"
                    placeholder="End"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <div
                  key={key}
                  className={`cursor-pointer ${CATEGORY_STYLES[key]} ${
                    formData.category === key
                      ? 'ring-2 ring-primary'
                      : 'opacity-70 hover:opacity-100'
                  } px-3 py-2 rounded-full transition-all text-sm`}
                  onClick={() =>
                    !isSubmitting &&
                    setFormData({
                      ...formData,
                      category: key as TCategory,
                    })
                  }
                >
                  {value}
                </div>
              ))}
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Priority</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(PRIORITIES).map(([key, value]) => (
                <div
                  key={key}
                  className={`cursor-pointer border ${
                    formData.priority === key
                      ? 'border-primary shadow-sm'
                      : 'border-base-300'
                  } rounded-md p-2 transition-colors hover:bg-base-200`}
                  onClick={() =>
                    !isSubmitting &&
                    setFormData({
                      ...formData,
                      priority: key as TPriority,
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

          <button
            type="button"
            className="btn btn-sm btn-ghost w-full"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? (
              <>
                <ChevronUp size={16} /> Hide advanced options
              </>
            ) : (
              <>
                <ChevronDown size={16} /> Show advanced options
              </>
            )}
          </button>

          {showAdvanced && (
            <div className="bg-base-200 p-4 rounded-lg">
              {!parentId && (
                <RecurringTaskSettings
                  isRecurring={formData.isRecurring}
                  recurrenceType={formData.recurrenceType}
                  recurrenceInterval={formData.recurrenceInterval}
                  recurrenceEndDate={formData.recurrenceEndDate}
                  recurrenceDaysOfWeek={formData.recurrenceDaysOfWeek}
                  onRecurrenceChange={handleRecurrenceChange}
                  disabled={isSubmitting}
                />
              )}
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              className="btn-primary"
              isLoading={isSubmitting}
              loadingText="Creating..."
            >
              Create Task
            </LoadingButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddTodo;
