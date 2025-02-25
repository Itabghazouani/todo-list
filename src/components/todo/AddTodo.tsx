'use client';

import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import {
  CATEGORIES,
  CATEGORY_STYLES,
  PRIORITIES,
  PRIORITY_STYLES,
} from '@/constants';
import type {
  TCategory,
  TPriority,
  ICreateTodoInput,
  ITodo,
} from '@/types/todos';
import Modal from '../Modal';
import LoadingButton from '../ui/LoadingButton';

interface IAddTodoProps {
  onTodoAdded?: (newTodo: ITodo) => void;
}

const AddTodo = ({ onTodoAdded }: IAddTodoProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ICreateTodoInput>({
    desc: '',
    category: '' as TCategory,
    priority: '' as TPriority,
  });

  const { addToast } = useToastStore();

  const resetForm = () => {
    setFormData({
      desc: '',
      category: '' as TCategory,
      priority: '' as TPriority,
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
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
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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

  return (
    <div>
      <button
        onClick={handleOpenModal}
        className="btn btn-primary w-full gap-2"
      >
        Add new task
        <Plus className="h-5 w-5" />
      </button>

      <Modal modalOpen={modalOpen} setModalOpen={setModalOpen}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <h3 className="font-bold text-lg text-base-content">
              Add new task
            </h3>
            <p className="text-base-content/70 text-sm mt-1">
              Fill in the details to create a new task
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
            <div className="grid grid-cols-2 gap-2">
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
