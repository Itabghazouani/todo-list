'use client';

import { useState, useEffect } from 'react';
import { Calendar, RepeatIcon } from 'lucide-react';
import { RecurrenceType } from '@/types/todos';
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
  onRecurrenceChange: (recurrenceData: {
    isRecurring: boolean;
    recurrenceType?: RecurrenceType | null;
    recurrenceInterval?: number | null;
    recurrenceEndDate?: string | null;
  }) => void;
  disabled?: boolean;
}

const RecurringTaskSettings = ({
  isRecurring,
  recurrenceType,
  recurrenceInterval,
  recurrenceEndDate,
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
  }, [isRecurring, recurrenceType, recurrenceInterval, recurrenceEndDate]);

  const updateRecurrence = () => {
    onRecurrenceChange({
      isRecurring: localIsRecurring,
      recurrenceType: localIsRecurring ? localType : null,
      recurrenceInterval: localIsRecurring ? localInterval : null,
      recurrenceEndDate: localIsRecurring && localEndDate ? localEndDate : null,
    });
  };

  const handleTypeChange = (type: RecurrenceType) => {
    setLocalType(type);
    setLocalInterval(DEFAULT_RECURRENCE_INTERVALS[type]);

    onRecurrenceChange({
      isRecurring: localIsRecurring,
      recurrenceType: type,
      recurrenceInterval: DEFAULT_RECURRENCE_INTERVALS[type],
      recurrenceEndDate: localEndDate || null,
    });
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
      });
    } else {
      onRecurrenceChange({
        isRecurring: newIsRecurring,
        recurrenceType: newIsRecurring ? localType : null,
        recurrenceInterval: newIsRecurring ? localInterval : null,
        recurrenceEndDate: newIsRecurring && localEndDate ? localEndDate : null,
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="form-control">
        <label className="cursor-pointer label justify-start gap-2">
          <input
            type="checkbox"
            checked={localIsRecurring}
            onChange={toggleRecurring}
            className="checkbox"
            disabled={disabled}
          />
          <span className="label-text flex items-center gap-1">
            <RepeatIcon size={16} />
            Recurring task
          </span>
        </label>
      </div>

      {localIsRecurring && (
        <>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Repeat pattern</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(RecurrenceType).map((type) => (
                <div
                  key={type}
                  className={`cursor-pointer ${disabled ? 'opacity-50' : ''} ${
                    RECURRENCE_TYPE_STYLES[type]
                  } ${
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

          <div className="form-control">
            <label className="label">
              <span className="label-text">Repeat every</span>
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
                className="input input-bordered w-20"
                disabled={disabled || !localType}
              />
              <span className="text-sm">
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
            <label className="label">
              <span className="label-text">End date (optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/70">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  value={localEndDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setLocalEndDate(e.target.value);
                    setTimeout(updateRecurrence, 0);
                  }}
                  className="input input-bordered pl-10 w-full"
                  disabled={disabled || !localType}
                />
              </div>
              {localEndDate && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
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
            <div className="text-sm font-medium">Summary:</div>
            <div className="text-sm text-base-content/70">
              {formatRecurrencePattern(localType, localInterval)}
              {localEndDate
                ? `, until ${new Date(localEndDate).toLocaleDateString()}`
                : ''}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecurringTaskSettings;
