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

    const todos = await prisma.todo.findMany({
      where: { userId },
    });

    const typedTodos = todos.map((todo) => ({
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
        <HomeComponent initialTodos={sortedTodos as ITodo[]} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error:', error);
    return <ErrorComponent error={error as Error} />;
  }
};

export default Home;
