import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { calculateNextOccurrence } from '@/utils/recurrenceUtils';

export const POST = async (request: Request) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();

    let recurringFields = {};
    if (data.isRecurring && data.recurrenceType && data.recurrenceInterval) {
      const nextOccurrence = calculateNextOccurrence(
        data.recurrenceType,
        data.recurrenceInterval,
      );

      recurringFields = {
        isRecurring: true,
        recurrenceType: data.recurrenceType,
        recurrenceInterval: data.recurrenceInterval,
        nextOccurrence,
        recurrenceEndDate: data.recurrenceEndDate || null,
      };
    }
    console.log('Creating todo with data:', data);
    const subtaskFields = data.isSubtask
      ? {
          isSubtask: true,
          parentId: data.parentId,
        }
      : {};

    const todo = await prisma.todo.create({
      data: {
        desc: data.desc,
        category: data.category,
        priority: data.priority,
        userId,
        ...recurringFields,
        ...subtaskFields,
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
