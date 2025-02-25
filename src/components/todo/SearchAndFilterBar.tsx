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
  // These props are optional and are for syncing with parent state if needed
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

  // Sync with parent state if props change
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

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm || selectedCategory || selectedPriority || !showCompleted;

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-base-content/70" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search todos..."
          className="input input-bordered w-full pl-10"
        />
      </div>

      <div className="flex justify-between mt-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-sm gap-2 ${
            showFilters ? 'btn-primary' : 'btn-ghost'
          }`}
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="btn btn-sm btn-ghost gap-1 text-error"
          >
            <X size={16} />
            Clear All Filters
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-3 space-y-4">
          {/* Category filter with visual buttons */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Category</span>
              {selectedCategory && (
                <button
                  className="label-text-alt text-error flex items-center gap-1"
                  onClick={() => handleCategoryChange(null)}
                >
                  <X size={12} /> Clear
                </button>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`btn btn-sm ${
                  !selectedCategory ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => handleCategoryChange(null)}
              >
                All
              </button>
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <button
                  key={key}
                  className={`btn btn-sm ${
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

          {/* Priority filter with visual buttons */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Priority</span>
              {selectedPriority && (
                <button
                  className="label-text-alt text-error flex items-center gap-1"
                  onClick={() => handlePriorityChange(null)}
                >
                  <X size={12} /> Clear
                </button>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`btn btn-sm ${
                  !selectedPriority ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => handlePriorityChange(null)}
              >
                All
              </button>
              {Object.entries(PRIORITIES).map(([key, value]) => (
                <button
                  key={key}
                  className={`btn btn-sm ${
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

          {/* Completed Toggle */}
          <div>
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={handleCompletedChange}
                className="checkbox"
              />
              <span className="label-text">Show Completed Tasks</span>
            </label>
          </div>

          {/* Active filters summary */}
          {hasActiveFilters && (
            <div className="bg-base-300 p-3 rounded-lg">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Filter size={14} />
                Active Filters:
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="badge badge-neutral">
                    Search: &quot;{searchTerm}&quot;
                  </span>
                )}
                {selectedCategory && (
                  <span
                    className={`badge ${CATEGORY_STYLES[selectedCategory]}`}
                  >
                    {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]}
                  </span>
                )}
                {selectedPriority && (
                  <span
                    className={`badge ${PRIORITY_STYLES[selectedPriority]}`}
                  >
                    {PRIORITIES[selectedPriority as keyof typeof PRIORITIES]}
                  </span>
                )}
                {!showCompleted && (
                  <span className="badge badge-accent">Hide Completed</span>
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
