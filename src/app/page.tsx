import { auth } from '@clerk/nextjs/server';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { sortTodosByPriority } from '@/utils/todoUtils';
import { ITodo } from '@/types/todos';
import HomeComponent from '@/components/todo/HomeComponent';
import {
  ErrorComponent,
  LoadingHomeComponent,
  WelcomeComponent,
} from '@/components/home';

const Home = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return <WelcomeComponent />;
    }

    const todos = await prisma.todo.findMany({
      where: { userId },
    });

    // Use the utility function for sorting
    const sortedTodos = sortTodosByPriority(todos);

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
