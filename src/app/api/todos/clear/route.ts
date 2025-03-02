import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const DELETE = async (request: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { type, keepIds, todoIds, visibleTodoIds } = await request.json();

    switch (type) {
      case 'completed':
        if (todoIds && Array.isArray(todoIds)) {
          // Delete specific completed todos by ID
          await prisma.todo.deleteMany({
            where: {
              userId,
              id: { in: todoIds },
              completed: true,
            },
          });
        } else {
          // Legacy behavior: delete all completed todos
          await prisma.todo.deleteMany({
            where: {
              userId,
              completed: true,
              isSubtask: true,
            },
          });

          await prisma.todo.deleteMany({
            where: {
              userId,
              completed: true,
              isSubtask: false,
            },
          });
        }
        break;

      case 'non-recurring':
        // Original implementation for all non-recurring todos
        if (keepIds && Array.isArray(keepIds)) {
          // First, delete non-recurring subtasks not in keepIds
          await prisma.todo.deleteMany({
            where: {
              userId,
              isSubtask: true,
              isRecurring: false,
              NOT: {
                id: { in: keepIds },
              },
            },
          });

          // Then delete non-recurring parent tasks not in keepIds
          await prisma.todo.deleteMany({
            where: {
              userId,
              isSubtask: false,
              isRecurring: false,
              NOT: {
                id: { in: keepIds },
              },
            },
          });
        } else {
          // Delete all non-recurring todos
          await prisma.todo.deleteMany({
            where: {
              userId,
              isRecurring: false,
            },
          });
        }
        break;

      case 'non-recurring-in-view':
        // New implementation for non-recurring todos in the current view
        if (
          visibleTodoIds &&
          Array.isArray(visibleTodoIds) &&
          keepIds &&
          Array.isArray(keepIds)
        ) {
          // Delete non-recurring todos that are in the visible set but not in keepIds
          await prisma.todo.deleteMany({
            where: {
              userId,
              id: { in: visibleTodoIds },
              isRecurring: false,
              NOT: {
                id: { in: keepIds },
              },
            },
          });
        }
        break;

      case 'all':
        // Delete all todos for the user
        await prisma.todo.deleteMany({
          where: {
            userId,
          },
        });
        break;

      case 'specific':
        // Delete specific todos by ID
        if (todoIds && Array.isArray(todoIds)) {
          await prisma.todo.deleteMany({
            where: {
              userId,
              id: { in: todoIds },
            },
          });
        } else {
          return new NextResponse('Todo IDs are required', { status: 400 });
        }
        break;

      default:
        return new NextResponse('Invalid clear type', { status: 400 });
    }

    return new NextResponse('Todos cleared successfully');
  } catch (error) {
    console.error('Error clearing todos:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
