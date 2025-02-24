import { ITodoBase } from '@/types/todos';

export const SAMPLE_TODOS: ITodoBase[] = [
  {
    id: '1',
    desc: 'Complete project documentation',
    category: 'WORK',
    priority: 'IMPORTANT_URGENT',
    completed: false,
  },
  {
    id: '2',
    desc: 'Review team updates',
    category: 'ADMINISTRATIVE',
    priority: 'NOT_IMPORTANT_NOT_URGENT',
    completed: true,
  },
];
