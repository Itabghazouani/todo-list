'use client';

import { useState } from 'react';

interface IClearTodosProps {
  onClearCompleted: () => void;
  onClearAll: () => void;
  completedCount: number;
  totalCount: number;
}

const ClearTodos = ({
  onClearCompleted,
  onClearAll,
  completedCount,
  totalCount,
}: IClearTodosProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <button
        className="btn btn-outline btn-sm"
        onClick={onClearCompleted}
        disabled={completedCount === 0}
      >
        Clear Completed ({completedCount})
      </button>

      {!showConfirm ? (
        <button
          className="btn btn-outline btn-error btn-sm"
          onClick={() => setShowConfirm(true)}
          disabled={totalCount === 0}
        >
          Clear All Todos
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            className="btn btn-error btn-sm"
            onClick={() => {
              onClearAll();
              setShowConfirm(false);
            }}
          >
            Confirm Clear All
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowConfirm(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ClearTodos;
