import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the start and end date from query parameters
    const url = new URL(request.url);
    const startDate = url.searchParams.get('start');
    const endDate = url.searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start and end date parameters are required' },
        { status: 400 },
      );
    }

    console.log(`Finding todo markers from ${startDate} to ${endDate}`);

    // Get all todos for the user
    const allTodos = await prisma.todo.findMany({
      where: {
        userId,
        // Not limiting by date range here because we need to check recurring todos too
      },
      select: {
        id: true,
        dueDate: true,
        isRecurring: true,
        recurrenceType: true,
        recurrenceInterval: true,
        recurrenceDaysOfWeek: true,
        nextOccurrence: true,
        createdAt: true,
        recurrenceEndDate: true,
      },
    });

    console.log(`Found ${allTodos.length} total todos`);

    // To store count of todos per date
    const markerMap: { [key: string]: number } = {};

    // Parse date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Helper to format dates consistently
    const formatDateStr = (dateStr: Date | null | string): string => {
      if (!dateStr) return '';
      return new Date(dateStr).toISOString().split('T')[0];
    };

    // Process each todo
    allTodos.forEach((todo) => {
      // Case 1: Todo has a specific due date
      if (todo.dueDate) {
        const dueDateStr = formatDateStr(todo.dueDate);

        // Check if it falls within the requested date range
        const dueDate = new Date(dueDateStr);
        if (dueDate >= start && dueDate <= end) {
          markerMap[dueDateStr] = (markerMap[dueDateStr] || 0) + 1;
        }
      }

      // Case 2: Recurring todo with next occurrence
      if (todo.isRecurring && todo.nextOccurrence) {
        const nextOccurrenceStr = formatDateStr(todo.nextOccurrence);

        // Check if it falls within the requested date range
        const nextOccurrence = new Date(nextOccurrenceStr);
        if (nextOccurrence >= start && nextOccurrence <= end) {
          markerMap[nextOccurrenceStr] =
            (markerMap[nextOccurrenceStr] || 0) + 1;
        }
      }

      // Case 3: Weekly recurring tasks
      if (
        todo.isRecurring &&
        todo.recurrenceType === 'WEEKLY' &&
        todo.recurrenceDaysOfWeek
      ) {
        try {
          const daysOfWeek = JSON.parse(todo.recurrenceDaysOfWeek);

          // For weekly recurring tasks, check every day in the range
          const currentDate = new Date(start);
          const creationDate = new Date(todo.createdAt);
          const formattedCreationDate = formatDateStr(creationDate);
          const endDateRecurrence = todo.recurrenceEndDate
            ? new Date(todo.recurrenceEndDate)
            : null;

          // Iterate through each day in the date range
          while (currentDate <= end) {
            const currentDateStr = formatDateStr(currentDate);

            // Skip if before creation date
            if (currentDateStr < formattedCreationDate) {
              currentDate.setDate(currentDate.getDate() + 1);
              continue;
            }

            // Skip if after end date (if specified)
            if (endDateRecurrence && currentDate > endDateRecurrence) {
              break;
            }

            // Check if this day of week is selected
            const dayOfWeek = currentDate.getDay(); // 0-6, where 0 is Sunday

            // Map to our day of week format
            const dayMap: Record<number, string> = {
              0: 'SUNDAY',
              1: 'MONDAY',
              2: 'TUESDAY',
              3: 'WEDNESDAY',
              4: 'THURSDAY',
              5: 'FRIDAY',
              6: 'SATURDAY',
            };

            // Check if the current day is part of the recurring pattern
            if (daysOfWeek.includes(dayMap[dayOfWeek])) {
              // For recurrence interval > 1, check if this week matches the pattern
              if (todo.recurrenceInterval && todo.recurrenceInterval > 1) {
                // Calculate weeks since creation
                const msPerWeek = 1000 * 60 * 60 * 24 * 7;
                const weeksSinceCreation = Math.floor(
                  (currentDate.getTime() - creationDate.getTime()) / msPerWeek,
                );

                // Only include if the week matches the interval
                if (weeksSinceCreation % todo.recurrenceInterval === 0) {
                  markerMap[currentDateStr] =
                    (markerMap[currentDateStr] || 0) + 1;
                }
              } else {
                // For weekly recurrence with interval 1, include every matching day
                markerMap[currentDateStr] =
                  (markerMap[currentDateStr] || 0) + 1;
              }
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } catch (e) {
          console.error('Error processing recurring task:', e);
        }
      }
    });

    console.log(`Generated ${Object.keys(markerMap).length} date markers`);
    return NextResponse.json(markerMap);
  } catch (error) {
    console.error('Error fetching todo markers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
