import { auth } from '@clerk/nextjs/server';

const Home = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold">Welcome to Todo App</h1>
          <p>Please sign in to continue</p>
        </div>
      );
    }

    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Todos</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">You&apos;ll see your todos here soon!</p>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Auth error:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p>Please try again later</p>
      </div>
    );
  }
};

export default Home;
