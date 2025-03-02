import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { RecurrenceType, DayOfWeek } from '@/types/todos';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the date from the URL query parameter
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 },
      );
    }

    console.log('Finding todos for date:', dateParam);

    // Parse the target date and normalize to YYYY-MM-DD
    // Use noon to avoid timezone issues affecting the day
    const targetDateObj = new Date(`${dateParam.split('T')[0]}T12:00:00Z`);
    const targetDateStr = targetDateObj.toISOString().split('T')[0];

    // Extract day of week (0-6, where 0 is Sunday)
    const targetDayOfWeek = targetDateObj.getDay();

    console.log(
      `Target date: ${targetDateStr}, day of week: ${targetDayOfWeek}`,
    );

    // Get all todos for the user
    const allTodos = await prisma.todo.findMany({
      where: {
        userId,
      },
      include: {
        dependencies: {
          include: {
            dependsOnTodo: {
              select: {
                id: true,
                desc: true,
                completed: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${allTodos.length} total todos for user`);

    // Map day numbers to our enum values
    const dayMap: Record<number, string> = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
    };

    const targetDayName = dayMap[targetDayOfWeek];
    console.log(`Target day is ${targetDayName}`);

    // Filter todos for the specific date
    const todosForDate = allTodos.filter((todo) => {
      // Helper to format dates consistently
      const formatDateStr = (dateStr: Date | null | string): string => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
      };

      // Case 1: Todo has a specific due date that matches target date
      if (todo.dueDate) {
        const dueDateStr = formatDateStr(todo.dueDate);
        const matches = dueDateStr === targetDateStr;
        if (matches) {
          console.log(`Todo ${todo.id} matches due date: ${dueDateStr}`);
          return true;
        }
      }

      // Case 2: Recurring todo with next occurrence matching target date
      if (todo.isRecurring && todo.nextOccurrence) {
        const nextOccurrenceStr = formatDateStr(todo.nextOccurrence);
        const matches = nextOccurrenceStr === targetDateStr;
        if (matches) {
          console.log(
            `Todo ${todo.id} matches next occurrence: ${nextOccurrenceStr}`,
          );
          return true;
        }
      }

      // Case 3: Weekly recurring task that matches the day of week
      if (
        todo.isRecurring &&
        todo.recurrenceType === RecurrenceType.WEEKLY &&
        todo.recurrenceDaysOfWeek
      ) {
        try {
          const daysOfWeek = JSON.parse(
            todo.recurrenceDaysOfWeek,
          ) as DayOfWeek[];

          // Check if the target day of week is in the selected days
          const matches = daysOfWeek.includes(targetDayName as DayOfWeek);

          if (matches) {
            // Verify date is within valid range
            const todoCreatedStr = formatDateStr(todo.createdAt);

            // Task must be created on or before the target date
            if (targetDateStr < todoCreatedStr) {
              console.log(
                `Todo ${todo.id} matches day ${targetDayName} but target date ${targetDateStr} is before creation date ${todoCreatedStr}`,
              );
              return false;
            }

            // If there's an end date, task must end on or after target date
            if (todo.recurrenceEndDate) {
              const endDateStr = formatDateStr(todo.recurrenceEndDate);
              if (targetDateStr > endDateStr) {
                console.log(
                  `Todo ${todo.id} matches day ${targetDayName} but target date ${targetDateStr} is after end date ${endDateStr}`,
                );
                return false;
              }
            }

            // Check for recurrence interval > 1
            if (todo.recurrenceInterval && todo.recurrenceInterval > 1) {
              // For intervals > 1, we need to ensure the target date is a multiple
              // of the interval away from the start date
              const creationDate = new Date(todo.createdAt);
              creationDate.setHours(12, 0, 0, 0);

              // Find creation date's day of week
              const creationDayOfWeek = creationDate.getDay();

              // Calculate days to first occurrence (to reach first matching day of week)
              let daysToFirstOccurrence = 0;
              if (targetDayOfWeek !== creationDayOfWeek) {
                daysToFirstOccurrence =
                  targetDayOfWeek > creationDayOfWeek
                    ? targetDayOfWeek - creationDayOfWeek
                    : 7 - creationDayOfWeek + targetDayOfWeek;
              }

              // Calculate the first occurrence date
              const firstOccurrence = new Date(creationDate);
              firstOccurrence.setDate(
                creationDate.getDate() + daysToFirstOccurrence,
              );

              // Check if weeks between first occurrence and target date is divisible by interval
              const targetDate = new Date(targetDateObj);
              const weeksBetween = Math.round(
                (targetDate.getTime() - firstOccurrence.getTime()) /
                  (7 * 24 * 60 * 60 * 1000),
              );

              if (weeksBetween % todo.recurrenceInterval !== 0) {
                console.log(
                  `Todo ${todo.id} matches day ${targetDayName} but target date ${targetDateStr} doesn't match interval pattern. Weeks between: ${weeksBetween}, Interval: ${todo.recurrenceInterval}`,
                );
                return false;
              }
            }

            console.log(
              `Todo ${todo.id} MATCHES day of week ${targetDayName} for target date: ${targetDateStr}`,
            );
            return true;
          }
        } catch (e) {
          console.error(
            'Error parsing recurrenceDaysOfWeek for todo',
            todo.id,
            ':',
            e,
          );
          return false;
        }
      }

      return false;
    });

    console.log(`Found ${todosForDate.length} todos for date ${targetDateStr}`);

    return NextResponse.json(todosForDate);
  } catch (error) {
    console.error('Error fetching todos by date:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
