// bg-red-900
// bg-red-800
// bg-red-700
// bg-red-600
// bg-red-500
// bg-red-400

export const PRIORITIES = {
  IMPORTANT_URGENT: 'Important - Urgent',
  IMPORTANT_NOT_URGENT: 'Important - Not Urgent',
  NOT_IMPORTANT_URGENT: 'Not Important - Urgent',
  NOT_IMPORTANT_NOT_URGENT: 'Not Important - Not Urgent',
} as const;

export const PRIORITY_STYLES: Record<string, string> = {
  IMPORTANT_URGENT: 'bg-red-800 text-white',
  IMPORTANT_NOT_URGENT: 'bg-red-700 text-white',
  NOT_IMPORTANT_URGENT: 'bg-red-600 text-white',
  NOT_IMPORTANT_NOT_URGENT: 'bg-red-400 text-white',
} as const;

export const PRIORITY_ORDER: { [key: string]: number } = {
  'Important - Urgent': 1,
  'Important - Not Urgent': 2,
  'Not Important - Urgent': 3,
  'Not Important - Not Urgent': 4,
};
