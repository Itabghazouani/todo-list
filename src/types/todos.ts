import { CATEGORIES, PRIORITIES } from '@/constants';

export type TCategory = keyof typeof CATEGORIES;
export type TPriority = keyof typeof PRIORITIES;

export interface ITodoBase {
  id: string;
  desc: string;
  category: TCategory;
  priority: TPriority;
  completed: boolean;
}

export interface ITodo extends ITodoBase {
  createdAt: Date;
  userId: string;
}

export interface ITodoDisplayProps {
  todo: ITodoBase;
}

export interface ICreateTodoInput {
  desc: string;
  category: TCategory;
  priority: TPriority;
}
