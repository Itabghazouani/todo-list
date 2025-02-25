import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ITodo } from '@/types/todos';
import HomeComponent from '@/components/todo/HomeComponent';
import { PRIORITY_ORDER } from '@/constants';

const Home = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return (
        <div className="hero min-h-[calc(100vh-4rem)] bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-base-content">
                Welcome to Todo App
              </h1>
              <p className="py-6 text-base-content/70">
                Please sign in to manage your tasks and stay organized
              </p>
            </div>
          </div>
        </div>
      );
    }

    const todos = await prisma.todo.findMany({
      where: { userId },
    });

    const sortedTodos = [...todos].sort((a, b) => {
      return (
        PRIORITY_ORDER[a.priority as string] -
        PRIORITY_ORDER[b.priority as string]
      );
    });

    return <HomeComponent initialTodos={sortedTodos as ITodo[]} />;
  } catch (error) {
    console.error('Error:', error);
    return (
      <div className="hero min-h-[calc(100vh-4rem)] bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <div className="alert alert-error">
              <div>
                <h1 className="text-2xl font-bold">Something went wrong</h1>
                <p className="opacity-70">Please try again later</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Home;
