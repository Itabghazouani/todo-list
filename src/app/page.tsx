import { auth } from '@clerk/nextjs/server';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { sortTodosByPriority } from '@/utils/todoUtils';
import { ITodo, RecurrenceType } from '@/types/todos';
import HomeComponent from '@/components/todo/HomeComponent';
import {
  ErrorComponent,
  LoadingHomeComponent,
  WelcomeComponent,
} from '@/components/home';

export const dynamic = 'force-dynamic';

const Home = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return <WelcomeComponent />;
    }

    // Get today's date and format it consistently
    const today = new Date();

    // Use noon time to avoid timezone issues
    today.setHours(12, 0, 0, 0);

    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get day of week for today (0-6, where 0 is Sunday)
    const dayOfWeek = today.getDay();

    // Map JavaScript day number to our enum day
    const dayMap: Record<number, string> = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
    };

    const todayDayOfWeek = dayMap[dayOfWeek];

    console.log(
      `Fetching todos for today: ${todayStr}, day of week: ${todayDayOfWeek}`,
    );

    // Get all todos for the user
    const allTodos = await prisma.todo.findMany({
      where: { userId },
    });

    console.log(`Found ${allTodos.length} total todos for user`);

    // Filter todos for today and tasks without dates (general tasks)
    const relevantTodos = allTodos.filter((todo) => {
      // CONDITION 1: Tasks with no date/time info (general tasks) should always appear
      const isGeneralTask =
        !todo.dueDate && !todo.nextOccurrence && !todo.isRecurring;

      if (isGeneralTask) {
        console.log(
          `Including todo "${todo.desc}" as a general task (no date/time info)`,
        );
        return true;
      }

      // CONDITION 2: Task has a due date that matches today
      if (todo.dueDate) {
        const dueDate = new Date(todo.dueDate);
        const dueDateStr = dueDate.toISOString().split('T')[0];
        if (dueDateStr === todayStr) {
          console.log(
            `Including todo "${todo.desc}" due to matching due date: ${dueDateStr}`,
          );
          return true;
        }
      }

      // CONDITION 3: Recurring todo with next occurrence matching today
      if (todo.isRecurring && todo.nextOccurrence) {
        const nextOccurrence = new Date(todo.nextOccurrence);
        const nextOccurrenceStr = nextOccurrence.toISOString().split('T')[0];
        if (nextOccurrenceStr === todayStr) {
          console.log(
            `Including todo "${todo.desc}" due to matching next occurrence: ${nextOccurrenceStr}`,
          );
          return true;
        }
      }

      // CONDITION 4: Weekly recurring task with today's day of week
      if (
        todo.isRecurring &&
        todo.recurrenceType === 'WEEKLY' &&
        todo.recurrenceDaysOfWeek
      ) {
        try {
          const daysOfWeek = JSON.parse(todo.recurrenceDaysOfWeek);

          // Check if today's day of week is in the selected days
          const match = daysOfWeek.includes(todayDayOfWeek);
          if (match) {
            console.log(
              `Including todo "${todo.desc}" due to matching day of week: ${todayDayOfWeek}`,
            );
            return true;
          }
        } catch (e) {
          console.error(
            `Error parsing recurrenceDaysOfWeek for todo ${todo.id}:`,
            e,
          );
          return false;
        }
      }

      return false;
    });

    console.log(
      `Found ${relevantTodos.length} relevant todos (today's tasks + general tasks) out of ${allTodos.length} total todos`,
    );

    // Convert todos to the expected format
    const typedTodos = relevantTodos.map((todo) => ({
      ...todo,
      recurrenceType: todo.recurrenceType as RecurrenceType | null | undefined,
      createdAt: todo.createdAt.toISOString(),
      recurrenceEndDate: todo.recurrenceEndDate
        ? todo.recurrenceEndDate.toISOString()
        : null,
      nextOccurrence: todo.nextOccurrence
        ? todo.nextOccurrence.toISOString()
        : null,
      lastCompletedAt: todo.lastCompletedAt
        ? todo.lastCompletedAt.toISOString()
        : null,
    }));
    const sortedTodos = sortTodosByPriority(typedTodos as ITodo[]);

    return (
      <Suspense fallback={<LoadingHomeComponent />}>
        <HomeComponent
          initialTodos={sortedTodos as ITodo[]}
          isTodayView={true}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error:', error);
    return <ErrorComponent error={error as Error} />;
  }
};

export default Home;
