import { ITodo, RecurrenceType, DayOfWeek } from '@/types/todos';

// JS Day type (0-6)
type JSDayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const calculateNextOccurrence = (
  recurrenceType: RecurrenceType,
  recurrenceInterval: number,
  baseDate: Date = new Date(),
  recurrenceDaysOfWeek?: string | null,
): Date => {
  // Make a copy of the date to avoid modifying the original
  const nextDate = new Date(baseDate);

  // Always set time to noon to avoid timezone issues affecting the day
  nextDate.setHours(12, 0, 0, 0);

  console.log(
    `Calculating next occurrence from base date: ${baseDate.toISOString()}`,
  );
  console.log(
    `Base date day of week: ${nextDate.getDay()} (0=Sun, 1=Mon, ..., 6=Sat)`,
  );
  console.log(
    `Recurrence type: ${recurrenceType}, interval: ${recurrenceInterval}`,
  );

  if (recurrenceDaysOfWeek) {
    console.log(`Recurrence days of week: ${recurrenceDaysOfWeek}`);
  }

  switch (recurrenceType) {
    case RecurrenceType.DAILY:
      nextDate.setDate(nextDate.getDate() + recurrenceInterval);
      break;

    case RecurrenceType.WEEKLY:
      // If specific days of week are specified, find the next occurrence
      if (recurrenceDaysOfWeek) {
        try {
          const daysOfWeek = JSON.parse(recurrenceDaysOfWeek) as DayOfWeek[];
          console.log(`Parsed days of week: ${daysOfWeek.join(', ')}`);

          if (daysOfWeek.length > 0) {
            // Convert enum days to JS day numbers (0 = Sunday, 1 = Monday, etc.)
            const jsDays = daysOfWeek
              .map((day) => {
                switch (day) {
                  case DayOfWeek.MONDAY:
                    return 1;
                  case DayOfWeek.TUESDAY:
                    return 2;
                  case DayOfWeek.WEDNESDAY:
                    return 3;
                  case DayOfWeek.THURSDAY:
                    return 4;
                  case DayOfWeek.FRIDAY:
                    return 5;
                  case DayOfWeek.SATURDAY:
                    return 6;
                  case DayOfWeek.SUNDAY:
                    return 0;
                  default:
                    return -1;
                }
              })
              .filter((day) => day !== -1) as JSDayNumber[];

            console.log(`Converted to JS days (0-6): ${jsDays.join(', ')}`);

            if (jsDays.length > 0) {
              // Get the current day of the week (0-6)
              const currentDayOfWeek = nextDate.getDay();
              console.log(`Current day of week: ${currentDayOfWeek}`);

              // Set up the next occurrence date
              let nextOccurrenceDate: Date;
              let daysToAdd = 0;

              // SPECIAL CASE: If base date is already the target day of week,
              // we should start from the NEXT week
              if (jsDays.includes(currentDayOfWeek as JSDayNumber)) {
                // We're already on one of the target days, so move to next week
                daysToAdd = 7 * recurrenceInterval;
                nextOccurrenceDate = new Date(nextDate);
                nextOccurrenceDate.setDate(nextDate.getDate() + daysToAdd);
                console.log(
                  `Already on target day, adding ${daysToAdd} days to next occurrence`,
                );
              } else {
                // Find the next day in our list
                const sortedDays = [...jsDays].sort((a, b) => a - b);

                // Find the next day in the current week
                let foundNextDay = false;
                for (const day of sortedDays) {
                  if (day > currentDayOfWeek) {
                    daysToAdd = day - currentDayOfWeek;
                    foundNextDay = true;
                    break;
                  }
                }

                // If no days found later in this week, go to the first day next week
                if (!foundNextDay) {
                  const firstDayNextWeek = sortedDays[0];
                  daysToAdd = 7 - currentDayOfWeek + firstDayNextWeek;
                }

                nextOccurrenceDate = new Date(nextDate);
                nextOccurrenceDate.setDate(nextDate.getDate() + daysToAdd);

                // For recurrence intervals > 1, set the initial occurrence correctly
                // but all subsequent occurrences should follow the interval
                // (implemented in TodoCard when completing a recurring task)
              }

              console.log(`Adding ${daysToAdd} days to reach next occurrence`);
              console.log(
                `Next occurrence: ${nextOccurrenceDate.toISOString()}`,
              );
              return nextOccurrenceDate;
            }
          }
        } catch (e) {
          console.error('Error parsing recurrenceDaysOfWeek:', e);
        }
      }

      // Default weekly behavior if no days specified or if there was an error
      nextDate.setDate(nextDate.getDate() + recurrenceInterval * 7);
      break;

    case RecurrenceType.MONTHLY:
      const currentMonth = nextDate.getMonth();
      nextDate.setMonth(currentMonth + recurrenceInterval);

      // Handle month overflow (e.g., Jan 31 -> Feb 28)
      const newMonth = nextDate.getMonth();
      if (newMonth !== (currentMonth + recurrenceInterval) % 12) {
        nextDate.setDate(0); // Last day of previous month
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

  console.log(`Final next occurrence: ${nextDate.toISOString()}`);
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
    todo.recurrenceDaysOfWeek,
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

// Helper function to format day names
export const formatDaysOfWeek = (daysOfWeek: DayOfWeek[]): string => {
  if (!daysOfWeek || daysOfWeek.length === 0) return '';

  // Sort days to be in correct order (Monday first)
  const dayOrder: Record<DayOfWeek, number> = {
    [DayOfWeek.MONDAY]: 0,
    [DayOfWeek.TUESDAY]: 1,
    [DayOfWeek.WEDNESDAY]: 2,
    [DayOfWeek.THURSDAY]: 3,
    [DayOfWeek.FRIDAY]: 4,
    [DayOfWeek.SATURDAY]: 5,
    [DayOfWeek.SUNDAY]: 6,
  };

  const sortedDays = [...daysOfWeek].sort((a, b) => dayOrder[a] - dayOrder[b]);

  // Create abbreviations for days
  const dayAbbreviations: Record<DayOfWeek, string> = {
    [DayOfWeek.MONDAY]: 'Mon',
    [DayOfWeek.TUESDAY]: 'Tue',
    [DayOfWeek.WEDNESDAY]: 'Wed',
    [DayOfWeek.THURSDAY]: 'Thu',
    [DayOfWeek.FRIDAY]: 'Fri',
    [DayOfWeek.SATURDAY]: 'Sat',
    [DayOfWeek.SUNDAY]: 'Sun',
  };

  // If all days are selected, return "Every day"
  if (sortedDays.length === 7) return 'every day';

  // If weekdays are selected, return "Weekdays"
  const weekdays = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ];

  if (
    weekdays.every((day) => sortedDays.includes(day)) &&
    sortedDays.length === 5
  ) {
    return 'weekdays';
  }

  // If weekend days are selected, return "Weekends"
  const weekendDays = [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY];

  if (
    weekendDays.every((day) => sortedDays.includes(day)) &&
    sortedDays.length === 2
  ) {
    return 'weekends';
  }

  // Otherwise, list the days
  return sortedDays.map((day) => dayAbbreviations[day]).join(', ');
};

export const formatRecurrencePattern = (
  recurrenceType?: RecurrenceType | null,
  recurrenceInterval?: number | null,
  selectedDays?: DayOfWeek[],
): string => {
  if (!recurrenceType || !recurrenceInterval) return 'Not recurring';

  switch (recurrenceType) {
    case RecurrenceType.DAILY:
      return recurrenceInterval === 1
        ? 'Daily'
        : `Every ${recurrenceInterval} days`;
    case RecurrenceType.WEEKLY:
      const weeklyBase =
        recurrenceInterval === 1
          ? 'Weekly'
          : `Every ${recurrenceInterval} weeks`;

      if (selectedDays && selectedDays.length > 0) {
        return `${weeklyBase} on ${formatDaysOfWeek(selectedDays)}`;
      }
      return weeklyBase;

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

// Helper to check if a todo is due on a specific date
export const isTodoDueOnDate = (todo: ITodo, date: Date): boolean => {
  // Format dates to YYYY-MM-DD for comparison
  const formatDate = (d: Date): string => {
    return d.toISOString().split('T')[0];
  };

  const targetDateStr = formatDate(date);

  // Case 1: Todo has a specific due date
  if (todo.dueDate) {
    const todoDueDateStr = formatDate(new Date(todo.dueDate));
    return todoDueDateStr === targetDateStr;
  }

  // Case 2: Todo is recurring
  if (todo.isRecurring && todo.recurrenceType && todo.recurrenceInterval) {
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
};
