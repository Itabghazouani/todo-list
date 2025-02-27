'use client';

import { useState } from 'react';
import { Trash2, CheckSquare, RepeatIcon } from 'lucide-react';
import { ConfirmDialog, LoadingButton } from '../ui';

interface IClearTodosProps {
  onClearCompleted: () => Promise<void>;
  onClearAll: () => Promise<void>;
  onClearNonRecurring?: () => Promise<void>; // New prop for clearing non-recurring todos
  completedCount: number;
  totalCount: number;
  recurringCount?: number; // Optional count of recurring tasks
}

const ClearTodos = ({
  onClearCompleted,
  onClearAll,
  onClearNonRecurring,
  completedCount,
  totalCount,
  recurringCount = 0,
}: IClearTodosProps) => {
  const [isCompletedLoading, setIsCompletedLoading] = useState(false);
  const [isAllLoading, setIsAllLoading] = useState(false);
  const [isNonRecurringLoading, setIsNonRecurringLoading] = useState(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);
  const [showConfirmClearNonRecurring, setShowConfirmClearNonRecurring] =
    useState(false);

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

  const handleClearNonRecurring = async () => {
    if (!onClearNonRecurring) return;

    setIsNonRecurringLoading(true);
    try {
      await onClearNonRecurring();
    } finally {
      setIsNonRecurringLoading(false);
    }
    setShowConfirmClearNonRecurring(false);
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

        {onClearNonRecurring && (
          <LoadingButton
            className="btn-outline btn-warning btn-sm gap-2"
            onClick={() => setShowConfirmClearNonRecurring(true)}
            disabled={totalCount === 0 || totalCount === recurringCount}
            isLoading={isNonRecurringLoading}
            loadingText="Clearing..."
          >
            <RepeatIcon size={16} />
            Keep Only Recurring
          </LoadingButton>
        )}

        <LoadingButton
          className="btn-outline btn-error btn-sm gap-2"
          onClick={() => setShowConfirmClearAll(true)}
          disabled={totalCount === 0}
          isLoading={isAllLoading}
          loadingText="Clearing..."
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

      <ConfirmDialog
        isOpen={showConfirmClearNonRecurring}
        title="Keep Only Recurring Tasks"
        message="This will delete all non-recurring tasks. Recurring tasks will be kept. Are you sure you want to proceed?"
        confirmText="Yes, Proceed"
        confirmButtonClass="btn-warning"
        onConfirm={handleClearNonRecurring}
        onCancel={() => setShowConfirmClearNonRecurring(false)}
      />
    </>
  );
};

export default ClearTodos;
