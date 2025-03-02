import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { calculateNextOccurrence } from '@/utils/recurrenceUtils';
import { RecurrenceType } from '@/types/todos';
import { Prisma } from '@prisma/client';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params: { id } }: RouteContext,
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const todo = await prisma.todo.findUnique({
      where: {
        id,
      },
    });

    if (!todo) {
      return new NextResponse('Todo not found', { status: 404 });
    }

    if (todo.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params: { id } }: RouteContext,
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the original todo to check ownership and handle completion
    const originalTodo = await prisma.todo.findUnique({
      where: {
        id,
      },
    });

    if (!originalTodo) {
      return new NextResponse('Todo not found', { status: 404 });
    }

    if (originalTodo.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const requestData = await request.json();
    console.log('Received update data:', requestData);

    // Remove fields that can't be updated
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      id: _id,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      userId: _userId,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdAt: _createdAt,
      ...data
    } = requestData;

    console.log('Cleaned update data (removed immutable fields):', data);

    // Process date fields properly for Prisma
    const updateData: Prisma.TodoUpdateInput = { ...data };

    // Convert string dates to Date objects for Prisma
    if (typeof data.dueDate === 'string' && data.dueDate) {
      try {
        // Ensure proper ISO format by adding time if it's only a date
        if (data.dueDate.length === 10) {
          // YYYY-MM-DD format
          updateData.dueDate = new Date(`${data.dueDate}T12:00:00Z`);
        } else {
          updateData.dueDate = new Date(data.dueDate);
        }
        console.log(
          `Converted dueDate from ${
            data.dueDate
          } to ${updateData.dueDate.toISOString()}`,
        );
      } catch (e) {
        console.error('Error converting dueDate:', e);
        return new NextResponse('Invalid date format for dueDate', {
          status: 400,
        });
      }
    } else if (data.dueDate === null) {
      updateData.dueDate = null;
    }

    // Handle recurrence end date
    if (typeof data.recurrenceEndDate === 'string' && data.recurrenceEndDate) {
      try {
        // Ensure proper ISO format by adding time if it's only a date
        if (data.recurrenceEndDate.length === 10) {
          // YYYY-MM-DD format
          updateData.recurrenceEndDate = new Date(
            `${data.recurrenceEndDate}T12:00:00Z`,
          );
        } else {
          updateData.recurrenceEndDate = new Date(data.recurrenceEndDate);
        }
      } catch (e) {
        console.error('Error converting recurrenceEndDate:', e);
        return new NextResponse('Invalid date format for recurrenceEndDate', {
          status: 400,
        });
      }
    } else if (data.recurrenceEndDate === null) {
      updateData.recurrenceEndDate = null;
    }

    // Special handling for completion status change - manage recurring tasks
    const isCompletionStatusChanged = originalTodo.completed !== data.completed;

    // If the todo is completed and it's recurring, prepare for next occurrence
    if (isCompletionStatusChanged && data.completed && data.isRecurring) {
      const completedAt = new Date();

      // Calculate next occurrence
      if (data.recurrenceType && data.recurrenceInterval) {
        const nextOccurrence = calculateNextOccurrence(
          data.recurrenceType as RecurrenceType,
          data.recurrenceInterval,
          completedAt,
          data.recurrenceDaysOfWeek,
        );

        console.log(
          `Calculated next occurrence: ${nextOccurrence.toISOString()}`,
        );

        // Check if there's a recurrence end date and if next occurrence is after it
        const recurrenceEndDate = updateData.recurrenceEndDate as
          | Date
          | null
          | undefined;
        if (recurrenceEndDate && nextOccurrence > recurrenceEndDate) {
          console.log('Next occurrence is after end date, no more occurrences');
          // No more occurrences
        } else {
          updateData.nextOccurrence = nextOccurrence;
          updateData.lastCompletedAt = completedAt;
        }
      }
    }

    console.log('Final update data being sent to Prisma:', updateData);

    // Update the todo with all changes
    const updatedTodo = await prisma.todo.update({
      where: {
        id,
      },
      data: updateData,
    });

    console.log('Todo updated successfully:', updatedTodo);
    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params: { id } }: RouteContext,
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const todo = await prisma.todo.findUnique({
      where: {
        id,
      },
    });

    if (!todo) {
      return new NextResponse('Todo not found', { status: 404 });
    }

    if (todo.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all subtasks to delete them as well
    const subtasks = await prisma.todo.findMany({
      where: {
        parentId: id,
      },
    });

    // Start a transaction to delete subtasks and the main todo
    await prisma.$transaction(async (tx) => {
      // Delete subtasks first
      for (const subtask of subtasks) {
        await tx.todo.delete({
          where: {
            id: subtask.id,
          },
        });
      }

      // Delete the main todo
      await tx.todo.delete({
        where: {
          id,
        },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
