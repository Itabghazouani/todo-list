import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
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
    const todoId = paramsObj.id;

    const todo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        userId,
      },
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const dependencies = await prisma.todoDependency.findMany({
      where: {
        todoId,
      },
      include: {
        dependsOnTodo: true,
      },
    });

    const dependentTasks = await prisma.todoDependency.findMany({
      where: {
        dependsOnTodoId: todoId,
      },
      include: {
        todo: true,
      },
    });

    return NextResponse.json({ dependencies, dependentTasks });
  } catch (error) {
    console.error('Error fetching dependencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dependencies' },
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
    const { dependsOnTodoId } = await request.json();

    const [todo, dependsOnTodo] = await Promise.all([
      prisma.todo.findFirst({
        where: {
          id: todoId,
          userId,
        },
      }),
      prisma.todo.findFirst({
        where: {
          id: dependsOnTodoId,
          userId,
        },
      }),
    ]);

    if (!todo || !dependsOnTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const circularDependency = await prisma.todoDependency.findFirst({
      where: {
        todoId: dependsOnTodoId,
        dependsOnTodoId: todoId,
      },
    });

    if (circularDependency) {
      return NextResponse.json(
        { error: 'Circular dependency detected' },
        { status: 400 },
      );
    }

    const existingDependency = await prisma.todoDependency.findFirst({
      where: {
        todoId,
        dependsOnTodoId,
      },
    });

    if (existingDependency) {
      return NextResponse.json(
        { error: 'Dependency already exists' },
        { status: 400 },
      );
    }

    const dependency = await prisma.todoDependency.create({
      data: {
        todoId,
        dependsOnTodoId,
      },
      include: {
        dependsOnTodo: true,
      },
    });

    return NextResponse.json(dependency);
  } catch (error) {
    console.error('Error creating dependency:', error);
    return NextResponse.json(
      { error: 'Failed to create dependency' },
      { status: 500 },
    );
  }
};

export const DELETE = async (
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
    const url = new URL(request.url);
    const dependsOnTodoId = url.searchParams.get('dependsOnTodoId');

    if (!dependsOnTodoId) {
      return NextResponse.json(
        { error: 'Missing dependsOnTodoId parameter' },
        { status: 400 },
      );
    }

    const todo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        userId,
      },
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    await prisma.todoDependency.deleteMany({
      where: {
        todoId,
        dependsOnTodoId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dependency:', error);
    return NextResponse.json(
      { error: 'Failed to delete dependency' },
      { status: 500 },
    );
  }
};
