'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Component that automatically updates recurring todos when the app is loaded
 * This should be included in a layout component that is always rendered
 */
const RecurringTodoUpdater = () => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check if we need to update (first load or day changed)
    const shouldUpdate = () => {
      if (!lastUpdated) return true;

      const now = new Date();
      const lastDay = lastUpdated.getDate();
      const currentDay = now.getDate();

      return lastDay !== currentDay;
    };

    const updateRecurringTodos = async () => {
      if (!shouldUpdate()) return;

      try {
        const response = await fetch('/api/todos/update-recurring', {
          method: 'POST',
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Recurring todos updated:', result);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Failed to update recurring todos:', error);
      }
    };

    // Update recurring todos when component mounts or when route changes
    updateRecurringTodos();
  }, [pathname, lastUpdated]);

  // This component doesn't render anything visually
  return null;
};

export default RecurringTodoUpdater;
