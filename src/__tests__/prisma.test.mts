import { prisma } from '../lib/prisma';

// Basic connection test
export const testConnection = async () => {
  try {
    const userCount = await prisma.user.count();
    console.log('Connection successful! User count:', userCount);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Placeholder for future user operations testing
export const testUserOperations = async (): Promise<void> => {
  throw new Error('User operations tests not yet implemented');
};

// Main test execution
export const runDatabaseTests = async () => {
  try {
    console.log('Starting database tests...');
    await testConnection();
    console.log('Database tests completed.');
  } catch (error) {
    console.error('Test suite failed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Only run tests if this file is being executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  runDatabaseTests();
}
