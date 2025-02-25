import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await request.json();

    if (type === 'completed') {
      await prisma.todo.deleteMany({
        where: {
          userId,
          completed: true,
        },
      });

      return NextResponse.json({
        message: 'Completed todos cleared successfully',
      });
    } else if (type === 'all') {
      await prisma.todo.deleteMany({
        where: {
          userId,
        },
      });

      return NextResponse.json({ message: 'All todos cleared successfully' });
    } else {
      return NextResponse.json(
        { error: 'Invalid clear type' },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('Error clearing todos:', error);
    return NextResponse.json(
      { error: 'Failed to clear todos' },
      { status: 500 },
    );
  }
}
