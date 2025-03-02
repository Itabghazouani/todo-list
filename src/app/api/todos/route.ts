import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { calculateNextOccurrence } from '@/utils/recurrenceUtils';
import { RecurrenceType } from '@/types/todos';

export const POST = async (request: Request) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    console.log('Creating todo with data:', data);

    // Process date field if it exists
    let dueDate = null;
    if (data.dueDate) {
      // Set to noon to avoid timezone issues
      dueDate = new Date(`${data.dueDate.split('T')[0]}T12:00:00Z`);
      console.log(
        `Parsed due date: ${dueDate.toISOString()} from input: ${data.dueDate}`,
      );
    }

    // Handle recurring fields
    let recurringFields = {};
    if (data.isRecurring && data.recurrenceType) {
      console.log(
        `Setting up recurring task, type: ${data.recurrenceType}, interval: ${data.recurrenceInterval}`,
      );

      if (data.recurrenceDaysOfWeek) {
        console.log(`With days of week: ${data.recurrenceDaysOfWeek}`);
      }

      // For weekly recurrence with specific days, calculate next occurrence more carefully
      // For the first occurrence, use either dueDate or current date as base
      const baseDate = dueDate || new Date();
      baseDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

      console.log(
        `Using base date for recurrence calculation: ${baseDate.toISOString()}`,
      );

      const nextOccurrence = calculateNextOccurrence(
        data.recurrenceType as RecurrenceType,
        data.recurrenceInterval || 1,
        baseDate,
        data.recurrenceDaysOfWeek,
      );

      console.log(
        `Calculated next occurrence: ${nextOccurrence.toISOString()} for recurring todo`,
      );

      let recurrenceEndDate = null;
      if (data.recurrenceEndDate) {
        recurrenceEndDate = new Date(
          `${data.recurrenceEndDate.split('T')[0]}T12:00:00Z`,
        );
        console.log(
          `Parsed recurrence end date: ${recurrenceEndDate.toISOString()}`,
        );
      }

      recurringFields = {
        isRecurring: true,
        recurrenceType: data.recurrenceType,
        recurrenceInterval: data.recurrenceInterval || 1,
        nextOccurrence,
        recurrenceEndDate,
        recurrenceDaysOfWeek: data.recurrenceDaysOfWeek || null,
      };
    }

    // Handle subtask fields
    const subtaskFields = data.isSubtask
      ? {
          isSubtask: true,
          parentId: data.parentId,
        }
      : {};

    // Handle date and time fields
    const dateTimeFields = {
      dueDate,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
    };

    // Create the todo with all fields
    const todo = await prisma.todo.create({
      data: {
        desc: data.desc,
        category: data.category,
        priority: data.priority,
        userId,
        ...recurringFields,
        ...subtaskFields,
        ...dateTimeFields,
      },
    });

    console.log('Created todo:', todo);
    console.log(
      'Created recurring todo with properties:',
      Object.entries(todo)
        .filter(([key]) =>
          [
            'isRecurring',
            'recurrenceType',
            'recurrenceInterval',
            'nextOccurrence',
            'recurrenceEndDate',
            'recurrenceDaysOfWeek',
            'dueDate',
            'startTime',
            'endTime',
          ].includes(key),
        )
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
    );

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const GET = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    console.log(
      'Fetching todos, including recurring:',
      todos.filter((t) => t.isRecurring),
    );

    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 },
    );
  }
};
