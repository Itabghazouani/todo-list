import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();

    const todo = await prisma.todo.create({
      data: {
        desc: data.desc,
        category: data.category,
        priority: data.priority,
        userId: userId,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
