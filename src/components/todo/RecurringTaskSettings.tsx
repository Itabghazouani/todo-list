'use client';

import { useState, useEffect } from 'react';
import { Calendar, RepeatIcon } from 'lucide-react';
import { RecurrenceType, DayOfWeek } from '@/types/todos';
import {
  RECURRENCE_TYPES,
  RECURRENCE_TYPE_STYLES,
  DEFAULT_RECURRENCE_INTERVALS,
} from '@/constants/recurrence';
import { formatRecurrencePattern } from '@/utils/recurrenceUtils';

interface RecurringTaskSettingsProps {
  isRecurring: boolean;
  recurrenceType?: RecurrenceType | null;
  recurrenceInterval?: number | null;
  recurrenceEndDate?: string | Date | null;
  recurrenceDaysOfWeek?: string | null;
  onRecurrenceChange: (recurrenceData: {
    isRecurring: boolean;
    recurrenceType?: RecurrenceType | null;
    recurrenceInterval?: number | null;
    recurrenceEndDate?: string | null;
    recurrenceDaysOfWeek?: string | null;
  }) => void;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  { key: DayOfWeek.MONDAY, label: 'Mon' },
  { key: DayOfWeek.TUESDAY, label: 'Tue' },
  { key: DayOfWeek.WEDNESDAY, label: 'Wed' },
  { key: DayOfWeek.THURSDAY, label: 'Thu' },
  { key: DayOfWeek.FRIDAY, label: 'Fri' },
  { key: DayOfWeek.SATURDAY, label: 'Sat' },
  { key: DayOfWeek.SUNDAY, label: 'Sun' },
];

const RecurringTaskSettings = ({
  isRecurring,
  recurrenceType,
  recurrenceInterval,
  recurrenceEndDate,
  recurrenceDaysOfWeek,
  onRecurrenceChange,
  disabled = false,
}: RecurringTaskSettingsProps) => {
  const [localIsRecurring, setLocalIsRecurring] = useState(isRecurring);
  const [localType, setLocalType] = useState<RecurrenceType | null>(
    recurrenceType || null,
  );
  const [localInterval, setLocalInterval] = useState<number>(
    recurrenceInterval || 1,
  );
  const [localEndDate, setLocalEndDate] = useState<string>(
    recurrenceEndDate
      ? new Date(recurrenceEndDate).toISOString().split('T')[0]
      : '',
  );
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    recurrenceDaysOfWeek ? JSON.parse(recurrenceDaysOfWeek) : [],
  );

  useEffect(() => {
    setLocalIsRecurring(isRecurring);
    setLocalType(recurrenceType || null);
    setLocalInterval(recurrenceInterval || 1);

    if (recurrenceEndDate) {
      const dateStr = new Date(recurrenceEndDate).toISOString().split('T')[0];
      setLocalEndDate(dateStr);
    } else {
      setLocalEndDate('');
    }

    if (recurrenceDaysOfWeek) {
      try {
        setSelectedDays(JSON.parse(recurrenceDaysOfWeek));
      } catch (error) {
        console.error('Error:', error);
        setSelectedDays([]);
      }
    } else {
      setSelectedDays([]);
    }
  }, [
    isRecurring,
    recurrenceType,
    recurrenceInterval,
    recurrenceEndDate,
    recurrenceDaysOfWeek,
  ]);

  const updateRecurrence = () => {
    // Simply pass the recurrence data to the parent component
    // The form validation will happen at submission time
    onRecurrenceChange({
      isRecurring: localIsRecurring,
      recurrenceType: localIsRecurring ? localType : null,
      recurrenceInterval: localIsRecurring ? localInterval : null,
      recurrenceEndDate: localIsRecurring && localEndDate ? localEndDate : null,
      recurrenceDaysOfWeek:
        localIsRecurring &&
        localType === RecurrenceType.WEEKLY &&
        selectedDays.length > 0
          ? JSON.stringify(selectedDays)
          : null,
    });
  };

  const handleTypeChange = (type: RecurrenceType) => {
    setLocalType(type);
    setLocalInterval(DEFAULT_RECURRENCE_INTERVALS[type]);

    // If changing from weekly to another type, clear selected days
    const updatedSelectedDays =
      type === RecurrenceType.WEEKLY ? selectedDays : [];

    // Do NOT default to the current day when changing to weekly
    // Just keep whatever days were previously selected (if any)
    setSelectedDays(updatedSelectedDays);

    onRecurrenceChange({
      isRecurring: localIsRecurring,
      recurrenceType: type,
      recurrenceInterval: DEFAULT_RECURRENCE_INTERVALS[type],
      recurrenceEndDate: localEndDate || null,
      recurrenceDaysOfWeek:
        type === RecurrenceType.WEEKLY && updatedSelectedDays.length > 0
          ? JSON.stringify(updatedSelectedDays)
          : null,
    });

    // No toast here, just leave the visual indicator
  };

  const toggleDay = (day: DayOfWeek) => {
    if (disabled) return;

    const updatedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];

    // Allow removing all days - we'll handle validation when updating
    setSelectedDays(updatedDays);

    setTimeout(() => {
      // Only update if there's at least one day selected
      if (updatedDays.length > 0) {
        onRecurrenceChange({
          isRecurring: localIsRecurring,
          recurrenceType: localType,
          recurrenceInterval: localInterval,
          recurrenceEndDate: localEndDate || null,
          recurrenceDaysOfWeek: JSON.stringify(updatedDays),
        });
      }
      // No toast here, just don't update until days are selected
    }, 0);
  };

  const toggleRecurring = () => {
    const newIsRecurring = !localIsRecurring;
    setLocalIsRecurring(newIsRecurring);

    if (newIsRecurring && !localType) {
      setLocalType(RecurrenceType.DAILY);
      setLocalInterval(1);

      onRecurrenceChange({
        isRecurring: true,
        recurrenceType: RecurrenceType.DAILY,
        recurrenceInterval: 1,
        recurrenceEndDate: localEndDate || null,
        recurrenceDaysOfWeek: null,
      });
    } else {
      onRecurrenceChange({
        isRecurring: newIsRecurring,
        recurrenceType: newIsRecurring ? localType : null,
        recurrenceInterval: newIsRecurring ? localInterval : null,
        recurrenceEndDate: newIsRecurring && localEndDate ? localEndDate : null,
        recurrenceDaysOfWeek:
          newIsRecurring &&
          localType === RecurrenceType.WEEKLY &&
          selectedDays.length > 0
            ? JSON.stringify(selectedDays)
            : null,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="cursor-pointer label justify-start gap-2">
          <input
            type="checkbox"
            checked={localIsRecurring}
            onChange={toggleRecurring}
            className="checkbox checkbox-sm md:checkbox-md"
            disabled={disabled}
          />
          <span className="label-text text-sm md:text-base flex items-center gap-1">
            <RepeatIcon size={16} />
            Recurring task
          </span>
        </label>
      </div>

      {localIsRecurring && (
        <div className="space-y-4">
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-sm md:text-base font-medium">
                Repeat pattern
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-4">
              {Object.values(RecurrenceType).map((type) => (
                <div
                  key={type}
                  className={`cursor-pointer text-xs sm:text-sm ${
                    disabled ? 'opacity-50' : ''
                  } ${RECURRENCE_TYPE_STYLES[type]} ${
                    localType === type
                      ? 'ring-2 ring-primary'
                      : 'opacity-70 hover:opacity-100'
                  } p-2 rounded-md transition-all text-center`}
                  onClick={() => !disabled && handleTypeChange(type)}
                >
                  {RECURRENCE_TYPES[type]}
                </div>
              ))}
            </div>
          </div>

          {/* Days of week selector for weekly recurrence */}
          {localType === RecurrenceType.WEEKLY && (
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm md:text-base font-medium">
                  On which days?
                </span>
                {selectedDays.length === 0 && (
                  <span className="label-text-alt text-warning">
                    Please select at least one day
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day.key}
                    className={`cursor-pointer text-xs sm:text-sm 
                      ${
                        selectedDays.includes(day.key)
                          ? 'bg-primary text-primary-content font-medium'
                          : 'bg-base-300 text-base-content opacity-70 hover:opacity-100'
                      } py-1 px-2 rounded-full transition-all text-center`}
                    onClick={() => toggleDay(day.key)}
                  >
                    {day.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-sm md:text-base font-medium">
                Repeat every
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="999"
                value={localInterval}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > 0) {
                    setLocalInterval(val);
                    updateRecurrence();
                  }
                }}
                className="input input-bordered input-sm md:input-md w-16 md:w-20"
                disabled={disabled || !localType}
              />
              <span className="text-xs md:text-sm">
                {localType === RecurrenceType.DAILY
                  ? localInterval === 1
                    ? 'day'
                    : 'days'
                  : localType === RecurrenceType.WEEKLY
                  ? localInterval === 1
                    ? 'week'
                    : 'weeks'
                  : localType === RecurrenceType.MONTHLY
                  ? localInterval === 1
                    ? 'month'
                    : 'months'
                  : localType === RecurrenceType.YEARLY
                  ? localInterval === 1
                    ? 'year'
                    : 'years'
                  : 'days'}
              </span>
            </div>
          </div>

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-sm md:text-base font-medium">
                End date (optional)
              </span>
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="relative flex-grow">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/70">
                  <Calendar size={14} className="md:w-4 md:h-4" />
                </span>
                <input
                  type="date"
                  value={localEndDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setLocalEndDate(e.target.value);
                    setTimeout(updateRecurrence, 0);
                  }}
                  className="input input-bordered input-sm md:input-md pl-10 w-full"
                  disabled={disabled || !localType}
                />
              </div>
              {localEndDate && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost self-start"
                  onClick={() => {
                    setLocalEndDate('');
                    setTimeout(updateRecurrence, 0);
                  }}
                  disabled={disabled}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="bg-base-300 p-3 rounded-md">
            <div className="text-xs md:text-sm font-medium">Summary:</div>
            <div className="text-xs md:text-sm text-base-content/70 mt-1">
              {localType === RecurrenceType.WEEKLY && selectedDays.length === 0
                ? 'Please select at least one day of the week'
                : formatRecurrencePattern(
                    localType,
                    localInterval,
                    selectedDays,
                  )}
              {localEndDate
                ? `, until ${new Date(localEndDate).toLocaleDateString()}`
                : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTaskSettings;
