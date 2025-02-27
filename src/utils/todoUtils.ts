import { ITodo } from '@/types/todos';
import { PRIORITIES, PRIORITY_ORDER } from '@/constants';

export const sortTodosByPriority = (todos: ITodo[]): ITodo[] => {
  return [...todos].sort((a, b) => {
    const priorityAValue = PRIORITIES[a.priority];
    const priorityBValue = PRIORITIES[b.priority];

    return PRIORITY_ORDER[priorityAValue] - PRIORITY_ORDER[priorityBValue];
  });
};
