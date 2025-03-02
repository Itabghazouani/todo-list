import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateRecurringTodos } from '@/utils/recurringTodoService';

// This endpoint updates all recurring todos to set the correct next occurrence date
export async function POST() {
  try {
    const { userId } = await auth();

    // Only allow authenticated users
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await updateRecurringTodos();

    if (result.success) {
      return NextResponse.json({
        message: 'Recurring todos updated successfully',
        updatedCount: result.updatedCount,
      });
    } else {
      return NextResponse.json(
        {
          error: 'Failed to update recurring todos',
          details: result.error,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error in update-recurring route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
