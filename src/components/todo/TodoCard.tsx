'use client';

import { useState } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '../Modal';
import {
  CATEGORIES,
  CATEGORY_STYLES,
  PRIORITIES,
  PRIORITY_STYLES,
} from '@/constants';
import { ITodoBase } from '@/types/todos';

interface ITodoCardProps {
  todo: ITodoBase;
  onUpdate?: (todo: ITodoBase) => void;
  onDelete?: (id: string) => void;
  isPreview?: boolean;
}

export const TodoCard = ({
  todo,
  onUpdate,
  onDelete,
  isPreview = false,
}: ITodoCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editTodoData, setEditTodoData] = useState(todo);

  const handleCompletionToggle = () => {
    if (!isPreview && onUpdate) {
      onUpdate({
        ...todo,
        completed: !todo.completed,
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPreview && onUpdate) {
      try {
        onUpdate(editTodoData);
        setIsEditModalOpen(false);
      } catch (error) {
        console.error('Failed to edit todo:', error);
        alert('Failed to edit todo. Please try again.');
      }
    }
  };

  // Handle delete action
  const handleDelete = () => {
    if (!isPreview && onDelete) {
      onDelete(todo.id);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleCompletionToggle}
              className="checkbox checkbox-primary mt-1"
              readOnly={isPreview}
            />
            <div className="flex-1">
              <p
                className={`text-base-content ${
                  todo.completed ? 'line-through opacity-50' : ''
                }`}
              >
                {todo.desc}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
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

            {/* Action Buttons - Only show if not in preview mode */}
            {!isPreview && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn btn-ghost btn-square btn-sm"
                  aria-label="Edit todo"
                >
                  <FiEdit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="btn btn-ghost btn-square btn-sm text-error"
                  aria-label="Delete todo"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal modalOpen={isEditModalOpen} setModalOpen={setIsEditModalOpen}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <h3 className="font-bold text-lg text-base-content">Edit Todo</h3>
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
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              value={editTodoData.category}
              onChange={(e) =>
                setEditTodoData({
                  ...editTodoData,
                  category: e.target.value as ITodoBase['category'],
                })
              }
              className="select select-bordered w-full"
            >
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Priority</span>
            </label>
            <select
              value={editTodoData.priority}
              onChange={(e) =>
                setEditTodoData({
                  ...editTodoData,
                  priority: e.target.value as ITodoBase['priority'],
                })
              }
              className="select select-bordered w-full"
            >
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
              onClick={() => setIsEditModalOpen(false)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      <Modal modalOpen={isDeleteModalOpen} setModalOpen={setIsDeleteModalOpen}>
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-base-content">Delete Todo</h3>
          <p className="text-base-content/70">
            Are you sure you want to delete this todo?
          </p>
          <div className="modal-action">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button onClick={handleDelete} className="btn btn-error">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
