// src/utils/todoUtils.ts
import { ITodo } from '@/types/todos';
import { PRIORITIES, PRIORITY_ORDER } from '@/constants';

/**
 * Sorts todos by priority using the Eisenhower Matrix order
 * @param todos Array of todos to sort
 * @returns New sorted array (doesn't modify original)
 */
export const sortTodosByPriority = (todos: ITodo[]): ITodo[] => {
  return [...todos].sort((a, b) => {
    // Get the priority values from the PRIORITIES object using the keys in the todos
    const priorityAValue = PRIORITIES[a.priority];
    const priorityBValue = PRIORITIES[b.priority];

    // Use those values to look up the order in PRIORITY_ORDER
    return PRIORITY_ORDER[priorityAValue] - PRIORITY_ORDER[priorityBValue];
  });
};
