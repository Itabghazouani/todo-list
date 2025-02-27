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
          },
        });
        break;

      case 'non-recurring':
        if (keepIds && Array.isArray(keepIds)) {
          // Delete all non-recurring todos except those with IDs in keepIds
          await prisma.todo.deleteMany({
            where: {
              userId,
              NOT: {
                id: {
                  in: keepIds,
                },
              },
            },
          });
        } else {
          // Fallback to deleting all non-recurring todos
          await prisma.todo.deleteMany({
            where: {
              userId,
              isRecurring: false,
            },
          });
        }
        break;

      case 'all':
        await prisma.todo.deleteMany({
          where: {
            userId,
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
