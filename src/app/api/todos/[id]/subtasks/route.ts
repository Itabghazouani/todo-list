import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Cache for subtasks to reduce database queries
const subtasksCache = new Map();

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
    const todoId = paramsObj.id;

    // Add a cache key using todoId and userId
    const cacheKey = `${userId}:${todoId}`;

    // Check if we have this in cache and it's not expired
    const cachedData = subtasksCache.get(cacheKey);
    if (cachedData) {
      const { data, timestamp } = cachedData;
      // Cache valid for 10 seconds
      if (Date.now() - timestamp < 10000) {
        return NextResponse.json(data);
      }
    }

    const parentTodo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        userId,
      },
    });

    if (!parentTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const subtasks = await prisma.todo.findMany({
      where: {
        parentId: todoId,
        userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Store in cache
    subtasksCache.set(cacheKey, {
      data: subtasks,
      timestamp: Date.now(),
    });

    return NextResponse.json(subtasks);
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subtasks' },
      { status: 500 },
    );
  }
};

export const POST = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paramsObj = await Promise.resolve(params);
    const todoId = paramsObj.id;
    const data = await request.json();

    const parentTodo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        userId,
      },
    });

    if (!parentTodo) {
      return NextResponse.json(
        { error: 'Parent todo not found' },
        { status: 404 },
      );
    }

    const subtask = await prisma.todo.create({
      data: {
        desc: data.desc,
        category: data.category || parentTodo.category,
        priority: data.priority || parentTodo.priority,
        isSubtask: true,
        parentId: todoId,
        userId,
      },
    });

    // Invalidate cache when creating a new subtask
    const cacheKey = `${userId}:${todoId}`;
    subtasksCache.delete(cacheKey);

    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    console.error('Error creating subtask:', error);
    return NextResponse.json(
      { error: 'Failed to create subtask' },
      { status: 500 },
    );
  }
};
