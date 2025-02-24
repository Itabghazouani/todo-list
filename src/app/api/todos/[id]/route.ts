import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } },
) => {
  try {
    const { id } = await Promise.resolve(params);
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();

    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      return new NextResponse('Todo not found', { status: 404 });
    }

    if (existingTodo.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        desc: data.desc,
        category: data.category,
        priority: data.priority,
        completed: data.completed,
      },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } },
) => {
  try {
    const { id } = await Promise.resolve(params);
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      return new NextResponse('Todo not found', { status: 404 });
    }

    if (existingTodo.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
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
