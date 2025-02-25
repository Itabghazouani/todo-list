'use client';

import { useState } from 'react';

import { Trash2, CheckSquare } from 'lucide-react';
import { ConfirmDialog, LoadingButton } from '../ui';

interface IClearTodosProps {
  onClearCompleted: () => Promise<void>;
  onClearAll: () => Promise<void>;
  completedCount: number;
  totalCount: number;
}

const ClearTodos = ({
  onClearCompleted,
  onClearAll,
  completedCount,
  totalCount,
}: IClearTodosProps) => {
  const [isCompletedLoading, setIsCompletedLoading] = useState(false);
  const [isAllLoading, setIsAllLoading] = useState(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);

  const handleClearCompleted = async () => {
    setIsCompletedLoading(true);
    try {
      await onClearCompleted();
    } finally {
      setIsCompletedLoading(false);
    }
  };

  const handleClearAll = async () => {
    setIsAllLoading(true);
    try {
      await onClearAll();
    } finally {
      setIsAllLoading(false);
    }
    setShowConfirmClearAll(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2">
        <LoadingButton
          className="btn-outline btn-sm gap-2"
          onClick={handleClearCompleted}
          disabled={completedCount === 0}
          isLoading={isCompletedLoading}
          loadingText="Clearing..."
        >
          <CheckSquare size={16} />
          Clear Completed ({completedCount})
        </LoadingButton>

        <LoadingButton
          className="btn-outline btn-error btn-sm gap-2"
          onClick={() => setShowConfirmClearAll(true)}
          disabled={totalCount === 0}
          isLoading={isAllLoading}
        >
          <Trash2 size={16} />
          Clear All Todos
        </LoadingButton>
      </div>

      <ConfirmDialog
        isOpen={showConfirmClearAll}
        title="Clear All Todos"
        message="Are you sure you want to delete all your todos? This action cannot be undone."
        confirmText="Yes, Clear All"
        confirmButtonClass="btn-error"
        onConfirm={handleClearAll}
        onCancel={() => setShowConfirmClearAll(false)}
      />
    </>
  );
};

export default ClearTodos;
