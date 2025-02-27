import { ITodo, RecurrenceType } from '@/types/todos';

export const calculateNextOccurrence = (
  recurrenceType: RecurrenceType,
  recurrenceInterval: number,
  baseDate: Date = new Date(),
): Date => {
  const nextDate = new Date(baseDate);

  switch (recurrenceType) {
    case RecurrenceType.DAILY:
      nextDate.setDate(nextDate.getDate() + recurrenceInterval);
      break;
    case RecurrenceType.WEEKLY:
      nextDate.setDate(nextDate.getDate() + recurrenceInterval * 7);
      break;
    case RecurrenceType.MONTHLY:
      const currentMonth = nextDate.getMonth();
      nextDate.setMonth(currentMonth + recurrenceInterval);

      const newMonth = nextDate.getMonth();
      if (newMonth !== (currentMonth + recurrenceInterval) % 12) {
        nextDate.setDate(0);
      }
      break;
    case RecurrenceType.YEARLY:
      nextDate.setFullYear(nextDate.getFullYear() + recurrenceInterval);
      break;
    case RecurrenceType.CUSTOM:
      nextDate.setDate(nextDate.getDate() + recurrenceInterval);
      break;
    default:
      throw new Error(`Unknown recurrence type: ${recurrenceType}`);
  }

  return nextDate;
};

export const isRecurringTaskDue = (
  lastCompletedAt: Date | string | null | undefined,
  nextOccurrence: Date | string | null | undefined,
): boolean => {
  if (!nextOccurrence) return false;

  const now = new Date();
  const nextDate = new Date(nextOccurrence);

  return nextDate <= now;
};

export const prepareNextRecurringInstance = (
  todo: ITodo,
  completedAt: Date = new Date(),
) => {
  if (!todo.isRecurring || !todo.recurrenceType || !todo.recurrenceInterval) {
    return null;
  }

  const nextOccurrence = calculateNextOccurrence(
    todo.recurrenceType,
    todo.recurrenceInterval,
    completedAt,
  );

  if (
    todo.recurrenceEndDate &&
    nextOccurrence > new Date(todo.recurrenceEndDate)
  ) {
    return null;
  }

  return {
    lastCompletedAt: completedAt,
    nextOccurrence,
    completed: false,
  };
};

export const formatRecurrencePattern = (
  recurrenceType?: RecurrenceType | null,
  recurrenceInterval?: number | null,
): string => {
  if (!recurrenceType || !recurrenceInterval) return 'Not recurring';

  switch (recurrenceType) {
    case RecurrenceType.DAILY:
      return recurrenceInterval === 1
        ? 'Daily'
        : `Every ${recurrenceInterval} days`;
    case RecurrenceType.WEEKLY:
      return recurrenceInterval === 1
        ? 'Weekly'
        : `Every ${recurrenceInterval} weeks`;
    case RecurrenceType.MONTHLY:
      return recurrenceInterval === 1
        ? 'Monthly'
        : `Every ${recurrenceInterval} months`;
    case RecurrenceType.YEARLY:
      return recurrenceInterval === 1
        ? 'Yearly'
        : `Every ${recurrenceInterval} years`;
    case RecurrenceType.CUSTOM:
      return `Every ${recurrenceInterval} days (custom)`;
    default:
      return 'Unknown pattern';
  }
};

export const calculateSubtaskProgress = (subtasks: ITodo[]): number => {
  if (!subtasks || subtasks.length === 0) return 0;

  const completedCount = subtasks.filter((task) => task.completed).length;
  return Math.round((completedCount / subtasks.length) * 100);
};
