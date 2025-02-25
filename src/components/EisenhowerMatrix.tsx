import React from 'react';
import { ITodo } from '@/types/todos';
import { PRIORITIES, PRIORITY_STYLES } from '@/constants/priorities';

const EisenhowerMatrix = ({ todos }: { todos: ITodo[] }) => {
  const todosByPriority = {
    IMPORTANT_URGENT: todos.filter(
      (todo) => todo.priority === 'IMPORTANT_URGENT',
    ),
    IMPORTANT_NOT_URGENT: todos.filter(
      (todo) => todo.priority === 'IMPORTANT_NOT_URGENT',
    ),
    NOT_IMPORTANT_URGENT: todos.filter(
      (todo) => todo.priority === 'NOT_IMPORTANT_URGENT',
    ),
    NOT_IMPORTANT_NOT_URGENT: todos.filter(
      (todo) => todo.priority === 'NOT_IMPORTANT_NOT_URGENT',
    ),
  };

  return (
    <div className="grid grid-cols-2 gap-4 mt-8 mb-8">
      <div className="border border-red-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-2 text-red-800">DO</h3>
        <p className="text-sm mb-4 text-gray-600">
          {PRIORITIES.IMPORTANT_URGENT}
        </p>
        <ul className="space-y-2">
          {todosByPriority.IMPORTANT_URGENT.map((todo) => (
            <li
              key={todo.id}
              className={`p-2 rounded ${PRIORITY_STYLES.IMPORTANT_URGENT.replace(
                'text-white',
                'bg-opacity-20',
              )}`}
            >
              {todo.desc}
            </li>
          ))}
        </ul>
      </div>

      <div className="border border-blue-700 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-2 text-blue-700">SCHEDULE</h3>
        <p className="text-sm mb-4 text-gray-600">
          {PRIORITIES.IMPORTANT_NOT_URGENT}
        </p>
        <ul className="space-y-2">
          {todosByPriority.IMPORTANT_NOT_URGENT.map((todo) => (
            <li
              key={todo.id}
              className={`p-2 rounded ${PRIORITY_STYLES.IMPORTANT_NOT_URGENT.replace(
                'text-white',
                'bg-opacity-20',
              )}`}
            >
              {todo.desc}
            </li>
          ))}
        </ul>
      </div>

      {/* Not Important & Urgent */}
      <div className="border border-yellow-600 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-2 text-yellow-600">DELEGATE</h3>
        <p className="text-sm mb-4 text-gray-600">
          {PRIORITIES.NOT_IMPORTANT_URGENT}
        </p>
        <ul className="space-y-2">
          {todosByPriority.NOT_IMPORTANT_URGENT.map((todo) => (
            <li
              key={todo.id}
              className={`p-2 rounded ${PRIORITY_STYLES.NOT_IMPORTANT_URGENT.replace(
                'text-white',
                'bg-opacity-20',
              )}`}
            >
              {todo.desc}
            </li>
          ))}
        </ul>
      </div>

      {/* Not Important & Not Urgent */}
      <div className="border border-gray-500 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-2 text-gray-500">ELIMINATE</h3>
        <p className="text-sm mb-4 text-gray-600">
          {PRIORITIES.NOT_IMPORTANT_NOT_URGENT}
        </p>
        <ul className="space-y-2">
          {todosByPriority.NOT_IMPORTANT_NOT_URGENT.map((todo) => (
            <li
              key={todo.id}
              className={`p-2 rounded ${PRIORITY_STYLES.NOT_IMPORTANT_NOT_URGENT.replace(
                'text-white',
                'bg-opacity-20',
              )}`}
            >
              {todo.desc}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EisenhowerMatrix;
