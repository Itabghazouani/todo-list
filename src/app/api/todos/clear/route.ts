import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const DELETE = async (request: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { type, keepIds } = await request.json();

    switch (type) {
      case 'completed':
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
        break;

      case 'non-recurring':
        if (keepIds && Array.isArray(keepIds)) {
          // First, delete non-recurring subtasks not in keepIds
          await prisma.todo.deleteMany({
            where: {
              userId,
              isSubtask: true,
              isRecurring: false,
              NOT: {
                id: {
                  in: keepIds,
                },
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
                id: {
                  in: keepIds,
                },
              },
            },
          });
        } else {
          // First, delete all non-recurring subtasks
          await prisma.todo.deleteMany({
            where: {
              userId,
              isSubtask: true,
              isRecurring: false,
            },
          });

          // Then delete all non-recurring parent tasks
          await prisma.todo.deleteMany({
            where: {
              userId,
              isSubtask: false,
              isRecurring: false,
            },
          });
        }
        break;

      case 'all':
        // First, delete all subtasks
        await prisma.todo.deleteMany({
          where: {
            userId,
            isSubtask: true,
          },
        });

        // Then delete all parent tasks
        await prisma.todo.deleteMany({
          where: {
            userId,
            isSubtask: false,
          },
        });
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
