// Functions to validate todo form submissions

import { RecurrenceType } from '@/types/todos';

/**
 * Validates the recurring task settings for a todo
 * @param formData The todo form data to validate
 * @param addToast Function to show toast messages
 * @returns True if validation passes, false otherwise
 */
export const validateRecurringTaskSettings = (
  formData: {
    isRecurring?: boolean;
    recurrenceType?: RecurrenceType | null;
    recurrenceDaysOfWeek?: string | null;
  },
  addToast: (message: string, type: string) => void,
): boolean => {
  // If task is not recurring, no validation needed
  if (!formData.isRecurring) {
    return true;
  }

  // For weekly recurrence, check if days are selected
  if (
    formData.recurrenceType === RecurrenceType.WEEKLY &&
    (!formData.recurrenceDaysOfWeek || formData.recurrenceDaysOfWeek === '[]')
  ) {
    addToast(
      'Please select at least one day of the week for weekly recurrence',
      'warning',
    );
    return false;
  }

  return true;
};
