'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Helper to generate calendar days
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// Format date as YYYY-MM-DD
const formatDateForUrl = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Month names array to avoid locale issues
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Day names array to avoid locale issues
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarComponent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get the current date param from URL or default to today
  const dateParam = searchParams.get('date');

  // Parse the date parameter or use today
  const today = new Date();

  // Always work with YYYY-MM-DD strings for consistency
  const todayStr = today.toISOString().split('T')[0];
  const initialDateStr = dateParam || todayStr;

  // Create date objects set to noon to avoid timezone issues
  const initialDate = new Date(`${initialDateStr}T12:00:00Z`);

  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [selectedDateStr, setSelectedDateStr] = useState(initialDateStr);
  const [todoMarkers, setTodoMarkers] = useState<{ [key: string]: number }>({});
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);

  // Log what date we're starting with
  console.log(`Calendar initializing with date: ${initialDateStr}`);
  console.log(`Month: ${currentMonth}, Year: ${currentYear}`);

  // Update URL when selected date changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', selectedDateStr);

    console.log(`Updating URL to date=${selectedDateStr}`);

    // Use replace to update the URL without adding to browser history
    router.replace(`${pathname}?${params.toString()}`);
  }, [selectedDateStr, pathname, router, searchParams]);

  // Fetch todo markers for the current month
  useEffect(() => {
    const fetchTodoMarkers = async () => {
      setIsLoadingMarkers(true);
      try {
        // Calculate start and end of month
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        const startDateStr = formatDateForUrl(startDate);
        const endDateStr = formatDateForUrl(endDate);

        console.log(
          `Fetching todo markers for month: ${startDateStr} to ${endDateStr}`,
        );

        const response = await fetch(
          `/api/todos/markers?start=${startDateStr}&end=${endDateStr}`,
        );

        if (response.ok) {
          const data = await response.json();
          setTodoMarkers(data);
          console.log('Received todo markers:', data);
        }
      } catch (error) {
        console.error('Error fetching todo markers:', error);
      } finally {
        setIsLoadingMarkers(false);
      }
    };

    fetchTodoMarkers();
  }, [currentMonth, currentYear]);

  // Generate days for the current month view
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  // Get name of current month
  const monthName = MONTH_NAMES[currentMonth];

  // Navigation handlers
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDateStr(todayStr);
  };

  const handleDateSelect = (day: number) => {
    // Create date string in YYYY-MM-DD format
    const newDate = new Date(currentYear, currentMonth, day, 12, 0, 0);
    const dateStr = newDate.toISOString().split('T')[0];

    console.log(
      `Selected date: ${dateStr} (day=${day}, month=${currentMonth}, year=${currentYear})`,
    );

    setSelectedDateStr(dateStr);
  };

  // Check if a date is the selected date
  const isSelectedDate = (day: number) => {
    const dateStr = new Date(currentYear, currentMonth, day, 12, 0, 0)
      .toISOString()
      .split('T')[0];
    return selectedDateStr === dateStr;
  };

  // Check if a date is today
  const isToday = (day: number) => {
    const dateStr = new Date(currentYear, currentMonth, day, 12, 0, 0)
      .toISOString()
      .split('T')[0];
    return todayStr === dateStr;
  };

  // Check if a date has todos
  const getTodoCount = (day: number) => {
    const dateStr = new Date(currentYear, currentMonth, day, 12, 0, 0)
      .toISOString()
      .split('T')[0];
    return todoMarkers[dateStr] || 0;
  };

  // Create the calendar view
  const renderCalendarDays = () => {
    const calendarDays = [];

    // Day names row
    calendarDays.push(
      <div key="daynames" className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center text-xs py-1 font-medium text-base-content/70"
          >
            {name}
          </div>
        ))}
      </div>,
    );

    // Empty cells for previous month
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="text-center p-1"></div>);
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const todoCount = getTodoCount(day);

      days.push(
        <div
          key={`day-${day}`}
          className={`
            text-center p-1 cursor-pointer hover:bg-base-200 rounded-md transition-colors relative
            ${
              isSelectedDate(day)
                ? 'bg-primary text-primary-content font-bold'
                : ''
            }
            ${
              isToday(day) && !isSelectedDate(day)
                ? 'border border-primary'
                : ''
            }
          `}
          onClick={() => handleDateSelect(day)}
        >
          <span className="text-sm">{day}</span>

          {/* Todo markers */}
          {todoCount > 0 && (
            <div className="flex justify-center mt-1 space-x-0.5">
              {todoCount <= 3 ? (
                // For 1-3 todos, show individual dots
                Array.from({ length: todoCount }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelectedDate(day) ? 'bg-primary-content' : 'bg-primary'
                    }`}
                  ></div>
                ))
              ) : (
                // For more than 3 todos, show count badge
                <div
                  className={`text-xs rounded-full px-1.5 py-0 text-center min-w-5 ${
                    isSelectedDate(day)
                      ? 'bg-primary-content text-primary'
                      : 'bg-primary text-primary-content'
                  }`}
                >
                  {todoCount}
                </div>
              )}
            </div>
          )}
        </div>,
      );
    }

    calendarDays.push(
      <div key="days" className="grid grid-cols-7 gap-1">
        {days}
      </div>,
    );

    return calendarDays;
  };

  return (
    <div className="calendar-widget bg-base-100 p-4 rounded-box shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon size={20} className="text-primary" />
          <h2 className="font-bold text-lg">Calendar</h2>
        </div>
        <button onClick={goToToday} className="btn btn-xs btn-ghost">
          Today
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goToPreviousMonth}
            className="btn btn-sm btn-ghost btn-square"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="font-medium">
            {monthName} {currentYear}
          </div>
          <button
            onClick={goToNextMonth}
            className="btn btn-sm btn-ghost btn-square"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className={isLoadingMarkers ? 'opacity-70' : ''}>
          {renderCalendarDays()}
        </div>
      </div>

      <div className="text-sm text-center text-base-content/70 mt-2">
        Selected: <span className="font-medium">{selectedDateStr}</span>
      </div>
    </div>
  );
};

export default CalendarComponent;
