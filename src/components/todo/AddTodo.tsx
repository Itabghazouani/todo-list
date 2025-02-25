'use client';

import { FormEvent, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';

import { CATEGORIES, PRIORITIES } from '@/constants';
import type {
  TCategory,
  TPriority,
  ICreateTodoInput,
  ITodo,
} from '@/types/todos';
import Modal from '../Modal';

interface IAddTodoProps {
  onTodoAdded?: (newTodo: ITodo) => void;
}

const AddTodo = ({ onTodoAdded }: IAddTodoProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<ICreateTodoInput>({
    desc: '',
    category: '' as TCategory,
    priority: '' as TPriority,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.desc.trim()) {
      alert('Please enter a task description');
      return;
    }
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    if (!formData.priority) {
      alert('Please select a priority');
      return;
    }

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

      setFormData({
        desc: '',
        category: '' as TCategory,
        priority: '' as TPriority,
      });
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to add todo:', error);
      alert('Failed to add todo. Please try again.');
    }
  };

  return (
    <div>
      <button
        onClick={() => setModalOpen(true)}
        className="btn btn-primary w-full gap-2"
      >
        Add new task
        <AiOutlinePlus className="h-5 w-5" />
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
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as TCategory,
                })
              }
              className="select select-bordered w-full"
            >
              <option value="" disabled>
                Select a category
              </option>
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Priority</span>
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as TPriority,
                })
              }
              className="select select-bordered w-full"
            >
              <option value="" disabled>
                Select priority level
              </option>
              {Object.entries(PRIORITIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddTodo;
