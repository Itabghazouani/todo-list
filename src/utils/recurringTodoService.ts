import { prisma } from '@/lib/prisma';
import { RecurrenceType, DayOfWeek } from '@/types/todos';
import { calculateNextOccurrence } from '@/utils/recurrenceUtils';

/**
 * Updates the next occurrence date for all recurring todos
 * This should be called when the app starts or periodically
 */
export async function updateRecurringTodos() {
  try {
    console.log('Running updateRecurringTodos...');

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Find all recurring todos that need updating (next occurrence is in the past or null)
    const recurringTodos = await prisma.todo.findMany({
      where: {
        isRecurring: true,
        AND: [
          { completed: false }, // Only update incomplete todos
        ],
      },
    });

    console.log(`Found ${recurringTodos.length} recurring todos to process`);

    let updatedCount = 0;

    // Process each todo
    for (const todo of recurringTodos) {
      // Skip if missing required recurrence data
      if (!todo.recurrenceType || !todo.recurrenceInterval) {
        console.warn(
          `Todo ${todo.id} is marked as recurring but missing recurrence data`,
        );
        continue;
      }

      const recurrenceType = todo.recurrenceType as RecurrenceType;

      // Only update todos whose next occurrence is in the past or null
      if (todo.nextOccurrence && new Date(todo.nextOccurrence) > today) {
        console.log(
          `Todo ${todo.id} next occurrence is in the future, skipping update`,
        );
        continue;
      }

      // Calculate next occurrence based on recurrence pattern
      let baseDate: Date;

      if (todo.lastCompletedAt) {
        // If it was completed before, start from last completion date
        baseDate = new Date(todo.lastCompletedAt);
      } else if (todo.nextOccurrence) {
        // If there's a previous next occurrence, use that
        baseDate = new Date(todo.nextOccurrence);
      } else if (todo.dueDate) {
        // If there's a due date, use that
        baseDate = new Date(todo.dueDate);
      } else {
        // Otherwise use today as the base
        baseDate = today;
      }

      // Calculate the next occurrence
      const nextOccurrence = calculateNextOccurrence(
        recurrenceType,
        todo.recurrenceInterval,
        baseDate,
        todo.recurrenceDaysOfWeek,
      );

      console.log(
        `Calculated next occurrence for todo ${
          todo.id
        }: ${nextOccurrence.toISOString()}`,
      );

      // Check if this recurring task has ended
      if (
        todo.recurrenceEndDate &&
        nextOccurrence > new Date(todo.recurrenceEndDate)
      ) {
        console.log(`Todo ${todo.id} has reached its recurrence end date`);
        continue;
      }

      // Update the todo with the new next occurrence
      await prisma.todo.update({
        where: { id: todo.id },
        data: { nextOccurrence },
      });

      console.log(
        `Updated todo ${
          todo.id
        } with next occurrence: ${nextOccurrence.toISOString()}`,
      );
      updatedCount++;
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error('Error updating recurring todos:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Checks if a todo should be due on a specific date
 * This incorporates all the recurrence pattern logic
 */
export function isTodoDueOnDate(
  todo: {
    dueDate: Date | null;
    isRecurring: boolean;
    recurrenceType: string | null;
    nextOccurrence: Date | null;
    recurrenceDaysOfWeek: string | null;
    createdAt: Date;
    recurrenceEndDate: Date | null;
  },
  date: Date,
): boolean {
  // Format dates to YYYY-MM-DD for comparison
  const formatDate = (d: Date): string => {
    return d.toISOString().split('T')[0];
  };

  const targetDateStr = formatDate(date);
  const creationDateStr = formatDate(new Date(todo.createdAt));

  // If target date is before creation date, it can't be due
  if (targetDateStr < creationDateStr) {
    return false;
  }

  // If there's a recurrence end date and target date is after that, it can't be due
  if (
    todo.recurrenceEndDate &&
    targetDateStr > formatDate(new Date(todo.recurrenceEndDate))
  ) {
    return false;
  }

  // Case 1: Todo has a specific due date
  if (todo.dueDate) {
    const todoDueDateStr = formatDate(new Date(todo.dueDate));
    return todoDueDateStr === targetDateStr;
  }

  // Case 2: Todo is recurring
  if (todo.isRecurring && todo.recurrenceType) {
    // If we have nextOccurrence, check if it falls on the target date
    if (todo.nextOccurrence) {
      const nextOccurrenceStr = formatDate(new Date(todo.nextOccurrence));
      return nextOccurrenceStr === targetDateStr;
    }

    // For weekly recurring tasks with specific days of the week
    if (
      todo.recurrenceType === RecurrenceType.WEEKLY &&
      todo.recurrenceDaysOfWeek
    ) {
      try {
        const daysOfWeek = JSON.parse(todo.recurrenceDaysOfWeek) as DayOfWeek[];

        // Check if the target date day is in the selected days
        const dayMap = {
          0: DayOfWeek.SUNDAY,
          1: DayOfWeek.MONDAY,
          2: DayOfWeek.TUESDAY,
          3: DayOfWeek.WEDNESDAY,
          4: DayOfWeek.THURSDAY,
          5: DayOfWeek.FRIDAY,
          6: DayOfWeek.SATURDAY,
        };

        const targetDay = date.getDay();
        return daysOfWeek.includes(dayMap[targetDay as keyof typeof dayMap]);
      } catch (e) {
        console.error('Error parsing recurrenceDaysOfWeek:', e);
      }
    }
  }

  return false;
}
