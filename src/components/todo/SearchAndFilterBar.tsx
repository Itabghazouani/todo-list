'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CATEGORIES, PRIORITIES } from '@/constants';

interface ISearchAndFilterBarProps {
  onSearch: (searchTerm: string) => void;
  onCategoryFilter: (category: string | null) => void;
  onPriorityFilter: (priority: string | null) => void;
  onCompletedFilter: (showCompleted: boolean) => void;
}

const SearchAndFilterBar = ({
  onSearch,
  onCategoryFilter,
  onPriorityFilter,
  onCompletedFilter,
}: ISearchAndFilterBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    onCategoryFilter(category);
  };

  const handlePriorityChange = (priority: string | null) => {
    setSelectedPriority(priority);
    onPriorityFilter(priority);
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
  };

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
          className="btn btn-sm btn-ghost gap-2"
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {(searchTerm ||
          selectedCategory ||
          selectedPriority ||
          !showCompleted) && (
          <button
            onClick={clearFilters}
            className="btn btn-sm btn-ghost gap-1 text-error"
          >
            <X size={16} />
            Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => handleCategoryChange(e.target.value || null)}
              className="select select-bordered w-full"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Priority</span>
            </label>
            <select
              value={selectedPriority || ''}
              onChange={(e) => handlePriorityChange(e.target.value || null)}
              className="select select-bordered w-full"
            >
              <option value="">All Priorities</option>
              {Object.entries(PRIORITIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* Completed Toggle */}
          <div className="flex items-end pb-3">
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
        </div>
      )}
    </div>
  );
};

export default SearchAndFilterBar;
