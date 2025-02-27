import { RecurrenceType } from '@/types/todos';

export const RECURRENCE_TYPES = {
  [RecurrenceType.DAILY]: 'Daily',
  [RecurrenceType.WEEKLY]: 'Weekly',
  [RecurrenceType.MONTHLY]: 'Monthly',
  [RecurrenceType.YEARLY]: 'Yearly',
  [RecurrenceType.CUSTOM]: 'Custom',
};

export const RECURRENCE_TYPE_STYLES = {
  [RecurrenceType.DAILY]: 'bg-blue-100 text-blue-800',
  [RecurrenceType.WEEKLY]: 'bg-purple-100 text-purple-800',
  [RecurrenceType.MONTHLY]: 'bg-green-100 text-green-800',
  [RecurrenceType.YEARLY]: 'bg-amber-100 text-amber-800',
  [RecurrenceType.CUSTOM]: 'bg-gray-100 text-gray-800',
};

export const DEFAULT_RECURRENCE_INTERVALS = {
  [RecurrenceType.DAILY]: 1,
  [RecurrenceType.WEEKLY]: 1,
  [RecurrenceType.MONTHLY]: 1,
  [RecurrenceType.YEARLY]: 1,
  [RecurrenceType.CUSTOM]: 3,
};
