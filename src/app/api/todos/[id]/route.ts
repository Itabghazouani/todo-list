import { prisma } from '@/lib/prisma';
import { RecurrenceType } from '@/types/todos';
import {
  calculateNextOccurrence,
  prepareNextRecurringInstance,
} from '@/utils/recurrenceUtils';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const GET = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paramsObj = await Promise.resolve(params);
    const id = paramsObj.id;

    const todo = await prisma.todo.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        subtasks: true,
        dependencies: {
          include: {
            dependsOnTodo: true,
          },
        },
        dependentTasks: {
          include: {
            todo: true,
          },
        },
      },
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todo' },
      { status: 500 },
    );
  }
};

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } },
) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fix #1: Await params.id (even though it's not actually async)
    const paramsObj = await Promise.resolve(params);
    const id = paramsObj.id;
    const data = await req.json();

    // Log the update data
    console.log('Updating todo with data:', data);

    // Find the existing todo
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    // Handle recurring task settings
    let recurringFields = {};
    if (data.isRecurring) {
      // If updating to be recurring, properly handle the recurring fields
      recurringFields = {
        isRecurring: true,
        recurrenceType: data.recurrenceType,
        recurrenceInterval: data.recurrenceInterval,
        recurrenceEndDate: data.recurrenceEndDate
          ? new Date(data.recurrenceEndDate)
          : null,
        // Calculate next occurrence if not already set
        nextOccurrence:
          data.nextOccurrence ||
          calculateNextOccurrence(data.recurrenceType, data.recurrenceInterval),
      };
    } else {
      // If removing recurring status, clear all recurring fields
      recurringFields = {
        isRecurring: false,
        recurrenceType: null,
        recurrenceInterval: null,
        recurrenceEndDate: null,
        nextOccurrence: null,
      };
    }

    // Special handling for recurring tasks being completed
    let completionUpdate = {};
    if (
      data.completed === true &&
      existingTodo.completed === false &&
      existingTodo.isRecurring
    ) {
      const now = new Date();
      const typedExistingTodo = {
        ...existingTodo,
        recurrenceType: existingTodo.recurrenceType as RecurrenceType | null,
      };
      const nextInstanceData = prepareNextRecurringInstance(
        typedExistingTodo,
        now,
      );

      if (nextInstanceData) {
        completionUpdate = {
          lastCompletedAt: now,
          nextOccurrence: nextInstanceData.nextOccurrence,
        };
      }
    }

    // Fix #2: Remove fields that shouldn't be updated
    // Create a clean data object without fields Prisma won't accept
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      id: _id, // Remove these fields from data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      userId: _userId,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdAt: _createdAt,
      ...updateData
    } = data;

    // Update the todo with all changes
    const updatedTodo = await prisma.todo.update({
      where: {
        id,
      },
      data: {
        ...updateData,
        ...recurringFields,
        ...completionUpdate,
      },
    });

    console.log(
      'Updated todo with recurring properties:',
      Object.entries(updatedTodo)
        .filter(([key]) =>
          [
            'isRecurring',
            'recurrenceType',
            'recurrenceInterval',
            'nextOccurrence',
            'recurrenceEndDate',
          ].includes(key),
        )
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
    );

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } },
) => {
  try {
    const paramsObj = await Promise.resolve(params);
    const id = paramsObj.id;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const existingTodo = await prisma.todo.findUnique({
      where: { id },
      include: {
        subtasks: true,
      },
    });

    if (!existingTodo) {
      return new NextResponse('Todo not found', { status: 404 });
    }

    if (existingTodo.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (existingTodo.subtasks && existingTodo.subtasks.length > 0) {
      await prisma.todo.deleteMany({
        where: {
          parentId: id,
        },
      });
    }

    await prisma.todo.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
