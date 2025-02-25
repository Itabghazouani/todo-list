'use client';

import { useState } from 'react';
import { ITodoBase } from '@/types/todos';
import { PRIORITIES, PRIORITY_STYLES } from '@/constants/priorities';
import { TodoCard } from '@/components';
import { CheckCircle, Clock, UserPlus, Trash2 } from 'lucide-react';

interface EisenhowerMatrixProps {
  todos: ITodoBase[];
  onUpdate?: (todo: ITodoBase) => void;
  onDelete?: (id: string) => void;
}

const EisenhowerMatrix = ({
  todos,
  onUpdate,
  onDelete,
}: EisenhowerMatrixProps) => {
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);

  const todosByPriority = {
    IMPORTANT_URGENT: todos.filter(
      (todo) =>
        todo.priority === 'IMPORTANT_URGENT' &&
        (!activeQuadrant || activeQuadrant === 'IMPORTANT_URGENT'),
    ),
    IMPORTANT_NOT_URGENT: todos.filter(
      (todo) =>
        todo.priority === 'IMPORTANT_NOT_URGENT' &&
        (!activeQuadrant || activeQuadrant === 'IMPORTANT_NOT_URGENT'),
    ),
    NOT_IMPORTANT_URGENT: todos.filter(
      (todo) =>
        todo.priority === 'NOT_IMPORTANT_URGENT' &&
        (!activeQuadrant || activeQuadrant === 'NOT_IMPORTANT_URGENT'),
    ),
    NOT_IMPORTANT_NOT_URGENT: todos.filter(
      (todo) =>
        todo.priority === 'NOT_IMPORTANT_NOT_URGENT' &&
        (!activeQuadrant || activeQuadrant === 'NOT_IMPORTANT_NOT_URGENT'),
    ),
  };

  // Calculate counts for each quadrant
  const counts = {
    IMPORTANT_URGENT: todos.filter(
      (todo) => todo.priority === 'IMPORTANT_URGENT',
    ).length,
    IMPORTANT_NOT_URGENT: todos.filter(
      (todo) => todo.priority === 'IMPORTANT_NOT_URGENT',
    ).length,
    NOT_IMPORTANT_URGENT: todos.filter(
      (todo) => todo.priority === 'NOT_IMPORTANT_URGENT',
    ).length,
    NOT_IMPORTANT_NOT_URGENT: todos.filter(
      (todo) => todo.priority === 'NOT_IMPORTANT_NOT_URGENT',
    ).length,
  };

  // Handle quadrant click to filter
  const handleQuadrantClick = (quadrant: string) => {
    setActiveQuadrant(activeQuadrant === quadrant ? null : quadrant);
  };

  // Matrices data for rendering
  const matrices = [
    {
      id: 'IMPORTANT_URGENT',
      title: 'DO',
      icon: <CheckCircle className="w-5 h-5" />,
      description: PRIORITIES.IMPORTANT_URGENT,
      color: 'red-800',
      borderColor: 'border-red-800',
      textColor: 'text-red-800',
      bgHover: 'hover:bg-red-50',
      bgColor: activeQuadrant === 'IMPORTANT_URGENT' ? 'bg-red-50' : '',
      todos: todosByPriority.IMPORTANT_URGENT,
      count: counts.IMPORTANT_URGENT,
      styleKey: 'IMPORTANT_URGENT',
    },
    {
      id: 'IMPORTANT_NOT_URGENT',
      title: 'SCHEDULE',
      icon: <Clock className="w-5 h-5" />,
      description: PRIORITIES.IMPORTANT_NOT_URGENT,
      color: 'blue-700',
      borderColor: 'border-blue-700',
      textColor: 'text-blue-700',
      bgHover: 'hover:bg-blue-50',
      bgColor: activeQuadrant === 'IMPORTANT_NOT_URGENT' ? 'bg-blue-50' : '',
      todos: todosByPriority.IMPORTANT_NOT_URGENT,
      count: counts.IMPORTANT_NOT_URGENT,
      styleKey: 'IMPORTANT_NOT_URGENT',
    },
    {
      id: 'NOT_IMPORTANT_URGENT',
      title: 'DELEGATE',
      icon: <UserPlus className="w-5 h-5" />,
      description: PRIORITIES.NOT_IMPORTANT_URGENT,
      color: 'yellow-600',
      borderColor: 'border-yellow-600',
      textColor: 'text-yellow-600',
      bgHover: 'hover:bg-yellow-50',
      bgColor: activeQuadrant === 'NOT_IMPORTANT_URGENT' ? 'bg-yellow-50' : '',
      todos: todosByPriority.NOT_IMPORTANT_URGENT,
      count: counts.NOT_IMPORTANT_URGENT,
      styleKey: 'NOT_IMPORTANT_URGENT',
    },
    {
      id: 'NOT_IMPORTANT_NOT_URGENT',
      title: 'ELIMINATE',
      icon: <Trash2 className="w-5 h-5" />,
      description: PRIORITIES.NOT_IMPORTANT_NOT_URGENT,
      color: 'gray-500',
      borderColor: 'border-gray-500',
      textColor: 'text-gray-500',
      bgHover: 'hover:bg-gray-50',
      bgColor:
        activeQuadrant === 'NOT_IMPORTANT_NOT_URGENT' ? 'bg-gray-50' : '',
      todos: todosByPriority.NOT_IMPORTANT_NOT_URGENT,
      count: counts.NOT_IMPORTANT_NOT_URGENT,
      styleKey: 'NOT_IMPORTANT_NOT_URGENT',
    },
  ];

  return (
    <div className="space-y-4">
      {activeQuadrant && (
        <div className="mb-4">
          <button
            onClick={() => setActiveQuadrant(null)}
            className="btn btn-sm btn-ghost"
          >
            ← Show All Quadrants
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matrices.map((matrix) => (
          <div
            key={matrix.id}
            className={`border ${
              matrix.borderColor
            } rounded-lg p-4 transition-all ${matrix.bgColor} ${
              matrix.bgHover
            } ${
              activeQuadrant && activeQuadrant !== matrix.id
                ? 'opacity-50'
                : 'opacity-100'
            }`}
            onClick={() => handleQuadrantClick(matrix.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3
                className={`text-lg font-bold ${matrix.textColor} flex items-center gap-2`}
              >
                {matrix.icon}
                {matrix.title}
              </h3>
              <span className="badge badge-md">{matrix.count}</span>
            </div>

            <p className="text-sm mb-4 text-base-content/70">
              {matrix.description}
            </p>

            {matrix.todos.length === 0 ? (
              <div className="text-center py-6 bg-base-200 rounded-lg opacity-70">
                <p className="text-sm">No tasks in this quadrant</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {matrix.todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="transition-all hover:translate-y-[-2px]"
                  >
                    {onUpdate && onDelete ? (
                      <TodoCard
                        todo={todo}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                      />
                    ) : (
                      <div
                        className={`p-3 rounded ${PRIORITY_STYLES[
                          matrix.styleKey
                        ].replace('text-white', 'bg-opacity-20')} shadow-sm`}
                      >
                        <p
                          className={
                            todo.completed ? 'line-through opacity-50' : ''
                          }
                        >
                          {todo.desc}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-base-200 rounded-lg">
        <h3 className="font-medium mb-2">Eisenhower Matrix Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded mt-1 bg-red-800"></div>
            <div>
              <p className="font-medium">Important and Urgent</p>
              <p className="text-base-content/70">Tasks to do immediately</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded mt-1 bg-blue-700"></div>
            <div>
              <p className="font-medium">Important but Not Urgent</p>
              <p className="text-base-content/70">
                Tasks to schedule for later
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded mt-1 bg-yellow-600"></div>
            <div>
              <p className="font-medium">Not Important but Urgent</p>
              <p className="text-base-content/70">
                Tasks to delegate if possible
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded mt-1 bg-gray-500"></div>
            <div>
              <p className="font-medium">Not Important and Not Urgent</p>
              <p className="text-base-content/70">
                Tasks to eliminate or do last
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EisenhowerMatrix;
