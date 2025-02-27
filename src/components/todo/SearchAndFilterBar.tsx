'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Search, Filter, X } from 'lucide-react';
import {
  CATEGORIES,
  PRIORITIES,
  CATEGORY_STYLES,
  PRIORITY_STYLES,
} from '@/constants';
import { useToastStore } from '@/store/toastStore';

interface ISearchAndFilterBarProps {
  onSearch: (searchTerm: string) => void;
  onCategoryFilter: (category: string | null) => void;
  onPriorityFilter: (priority: string | null) => void;
  onCompletedFilter: (showCompleted: boolean) => void;
  initialSearchTerm?: string;
  initialCategoryFilter?: string | null;
  initialPriorityFilter?: string | null;
  initialShowCompleted?: boolean;
}

const SearchAndFilterBar = ({
  onSearch,
  onCategoryFilter,
  onPriorityFilter,
  onCompletedFilter,
  initialSearchTerm = '',
  initialCategoryFilter = null,
  initialPriorityFilter = null,
  initialShowCompleted = true,
}: ISearchAndFilterBarProps) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategoryFilter,
  );
  const [selectedPriority, setSelectedPriority] = useState<string | null>(
    initialPriorityFilter,
  );
  const [showCompleted, setShowCompleted] = useState(initialShowCompleted);
  const { addToast } = useToastStore();

  useEffect(() => {
    if (initialSearchTerm !== undefined && initialSearchTerm !== searchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm, searchTerm]);

  useEffect(() => {
    if (
      initialCategoryFilter !== undefined &&
      initialCategoryFilter !== selectedCategory
    ) {
      setSelectedCategory(initialCategoryFilter);
    }
  }, [initialCategoryFilter, selectedCategory]);

  useEffect(() => {
    if (
      initialPriorityFilter !== undefined &&
      initialPriorityFilter !== selectedPriority
    ) {
      setSelectedPriority(initialPriorityFilter);
    }
  }, [initialPriorityFilter, selectedPriority]);

  useEffect(() => {
    if (
      initialShowCompleted !== undefined &&
      initialShowCompleted !== showCompleted
    ) {
      setShowCompleted(initialShowCompleted);
    }
  }, [initialShowCompleted, showCompleted]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    onCategoryFilter(category);
    if (category) {
      addToast(
        `Filtering by: ${CATEGORIES[category as keyof typeof CATEGORIES]}`,
        'info',
      );
    }
  };

  const handlePriorityChange = (priority: string | null) => {
    setSelectedPriority(priority);
    onPriorityFilter(priority);
    if (priority) {
      addToast(
        `Filtering by: ${PRIORITIES[priority as keyof typeof PRIORITIES]}`,
        'info',
      );
    }
  };

  const handleCompletedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowCompleted(e.target.checked);
    onCompletedFilter(e.target.checked);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedPriority(null);
    setShowCompleted(true);
    onSearch('');
    onCategoryFilter(null);
    onPriorityFilter(null);
    onCompletedFilter(true);
    addToast('All filters cleared', 'info');
  };

  const hasActiveFilters =
    searchTerm || selectedCategory || selectedPriority || !showCompleted;

  return (
    <div className="bg-base-200 rounded-lg p-3 sm:p-4 mb-4 shadow-sm">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={16} className="text-base-content/70" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search todos..."
          className="input input-bordered input-sm sm:input-md w-full pl-9"
        />
      </div>

      <div className="flex flex-wrap justify-between mt-3 gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-xs sm:btn-sm gap-1 ${
            showFilters ? 'btn-primary' : 'btn-ghost'
          }`}
        >
          <Filter size={14} />
          <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="btn btn-xs sm:btn-sm btn-ghost gap-1 text-error"
          >
            <X size={14} />
            <span className="sm:inline">Clear Filters</span>
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-3 space-y-3 sm:space-y-4">
          <div>
            <label className="label py-1">
              <span className="label-text font-medium text-sm">Category</span>
              {selectedCategory && (
                <button
                  className="label-text-alt text-error flex items-center gap-1"
                  onClick={() => handleCategoryChange(null)}
                >
                  <X size={12} /> Clear
                </button>
              )}
            </label>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <button
                className={`btn btn-xs sm:btn-sm ${
                  !selectedCategory ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => handleCategoryChange(null)}
              >
                All
              </button>
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <button
                  key={key}
                  className={`btn btn-xs sm:btn-sm ${
                    selectedCategory === key
                      ? `${CATEGORY_STYLES[key].replace(
                          'text-white',
                          '',
                        )} text-white`
                      : 'btn-ghost'
                  }`}
                  onClick={() => handleCategoryChange(key)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label py-1">
              <span className="label-text font-medium text-sm">Priority</span>
              {selectedPriority && (
                <button
                  className="label-text-alt text-error flex items-center gap-1"
                  onClick={() => handlePriorityChange(null)}
                >
                  <X size={12} /> Clear
                </button>
              )}
            </label>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <button
                className={`btn btn-xs sm:btn-sm ${
                  !selectedPriority ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => handlePriorityChange(null)}
              >
                All
              </button>
              {Object.entries(PRIORITIES).map(([key, value]) => (
                <button
                  key={key}
                  className={`btn btn-xs sm:btn-sm ${
                    selectedPriority === key
                      ? `${PRIORITY_STYLES[key].replace(
                          'text-white',
                          '',
                        )} text-white`
                      : 'btn-ghost'
                  }`}
                  onClick={() => handlePriorityChange(key)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label cursor-pointer justify-start gap-2 py-1">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={handleCompletedChange}
                className="checkbox checkbox-sm"
              />
              <span className="label-text text-sm">Show Completed Tasks</span>
            </label>
          </div>

          {hasActiveFilters && (
            <div className="bg-base-300 p-2 sm:p-3 rounded-lg">
              <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 flex items-center gap-1">
                <Filter size={12} />
                Active Filters:
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {searchTerm && (
                  <span className="badge badge-neutral badge-sm sm:badge-md">
                    Search: &quot;{searchTerm}&quot;
                  </span>
                )}
                {selectedCategory && (
                  <span
                    className={`badge badge-sm sm:badge-md ${CATEGORY_STYLES[selectedCategory]}`}
                  >
                    {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]}
                  </span>
                )}
                {selectedPriority && (
                  <span
                    className={`badge badge-sm sm:badge-md ${PRIORITY_STYLES[selectedPriority]}`}
                  >
                    {PRIORITIES[selectedPriority as keyof typeof PRIORITIES]}
                  </span>
                )}
                {!showCompleted && (
                  <span className="badge badge-accent badge-sm sm:badge-md">
                    Hide Completed
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilterBar;
