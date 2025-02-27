import { CATEGORIES, PRIORITIES } from '@/constants';

export type TCategory = keyof typeof CATEGORIES;
export type TPriority = keyof typeof PRIORITIES;

export enum RecurrenceType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export interface ITodoBase {
  id: string;
  desc: string;
  category: TCategory;
  priority: TPriority;
  completed: boolean;

  isSubtask?: boolean;
  parentId?: string | null;

  isRecurring?: boolean;
  recurrenceType?: RecurrenceType | null;
  recurrenceInterval?: number | null;
  recurrenceEndDate?: Date | string | null;
  nextOccurrence?: Date | string | null;
  lastCompletedAt?: Date | string | null;
}

export interface ITodo extends ITodoBase {
  createdAt: Date | string;
  userId: string;

  subtasks?: ITodo[];
  dependsOn?: IDependency[];
  dependentTasks?: IDependency[];
}

export interface ITodoDisplayProps {
  todo: ITodoBase;
}

export interface ICreateTodoInput {
  desc: string;
  category: TCategory;
  priority: TPriority;

  isSubtask?: boolean;
  parentId?: string;

  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceInterval?: number;
  recurrenceEndDate?: Date | string;
}

export interface IDependency {
  id: string;
  todoId: string;
  dependsOnTodoId: string;
  createdAt: Date | string;
  dependsOnTodo?: ITodo;
  todo?: ITodo;
}
