'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Search, Moon, Sun, PaintBucket } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { THEMES, PRIORITIES } from '@/constants';

import { SAMPLE_TODOS } from '@/constants/sampleTodos';
import { useToastStore } from '@/store/toastStore';
import { TTheme } from '@/types/themes';
import { TodoCard } from '@/components/todo';

const ThemesPage = () => {
  const { theme, setTheme } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredThemes, setFilteredThemes] = useState<TTheme[]>([...THEMES]);
  const [themeType, setThemeType] = useState<'all' | 'light' | 'dark'>('all');
  const { addToast } = useToastStore();

  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  useEffect(() => {
    let filtered = [...THEMES];

    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (themeType !== 'all') {
      const darkThemes = [
        'dark',
        'synthwave',
        'halloween',
        'forest',
        'black',
        'luxury',
        'dracula',
        'night',
        'coffee',
        'dim',
        'nord',
      ];

      if (themeType === 'dark') {
        filtered = filtered.filter((t) => darkThemes.includes(t));
      } else {
        filtered = filtered.filter((t) => !darkThemes.includes(t));
      }
    }

    setFilteredThemes(filtered);
  }, [searchTerm, themeType]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as TTheme);
    addToast(`Theme changed to ${newTheme}`, 'success');
  };

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8 max-w-5xl">
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
              Theme Settings
            </h1>
            <p className="text-sm sm:text-base text-base-content/70 mt-1">
              Customize the look and feel of your todo application
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <div className="badge badge-md sm:badge-lg text-xs sm:text-sm whitespace-nowrap">
              Current theme: {theme}
            </div>
            <button
              onClick={handleGoBack}
              className="btn btn-sm sm:btn-md btn-primary ml-auto sm:ml-0"
            >
              Done
            </button>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-base sm:text-lg font-bold text-base-content flex items-center gap-2">
                <PaintBucket size={16} className="sm:w-[18px] sm:h-[18px]" />
                Available Themes
              </h2>
              <p className="text-xs sm:text-sm text-base-content/70">
                Choose a theme that suits your style
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-base-content/50" />
                </div>
                <input
                  type="text"
                  placeholder="Search themes..."
                  className="input input-bordered pl-10 input-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="join w-full sm:w-auto grid grid-cols-3 sm:grid-cols-none sm:flex">
                <button
                  className={`btn btn-sm join-item ${
                    themeType === 'all' ? 'btn-active' : ''
                  }`}
                  onClick={() => setThemeType('all')}
                >
                  All
                </button>
                <button
                  className={`btn btn-sm join-item ${
                    themeType === 'light' ? 'btn-active' : ''
                  }`}
                  onClick={() => setThemeType('light')}
                >
                  <Sun size={14} className="sm:w-4 sm:h-4" />
                  <span className="ml-1 text-xs sm:text-sm">Light</span>
                </button>
                <button
                  className={`btn btn-sm join-item ${
                    themeType === 'dark' ? 'btn-active' : ''
                  }`}
                  onClick={() => setThemeType('dark')}
                >
                  <Moon size={14} className="sm:w-4 sm:h-4" />
                  <span className="ml-1 text-xs sm:text-sm">Dark</span>
                </button>
              </div>
            </div>
          </div>

          {filteredThemes.length === 0 ? (
            <div className="alert alert-info text-xs sm:text-sm p-3 sm:p-4">
              <div>
                <p>No themes match your search criteria.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 sm:gap-2">
              {filteredThemes.map((t) => (
                <button
                  key={t}
                  className={`
                group flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-lg transition-all
                ${
                  theme === t
                    ? 'ring-2 ring-primary bg-base-200'
                    : 'hover:bg-base-200/50'
                }
                touch-manipulation
              `}
                  onClick={() => handleThemeChange(t)}
                >
                  <div
                    className="relative h-8 sm:h-12 w-full rounded-md overflow-hidden shadow-md"
                    data-theme={t}
                  >
                    <div className="absolute inset-0 grid grid-cols-5 grid-rows-2 gap-px p-1">
                      <div className="rounded bg-primary"></div>
                      <div className="rounded bg-secondary"></div>
                      <div className="rounded bg-accent"></div>
                      <div className="rounded bg-neutral"></div>
                      <div className="rounded bg-base-300"></div>
                      <div className="rounded bg-info"></div>
                      <div className="rounded bg-success"></div>
                      <div className="rounded bg-warning"></div>
                      <div className="rounded bg-error"></div>
                      <div className="rounded bg-base-100"></div>
                    </div>
                    {theme === t && (
                      <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-30">
                        <Check className="w-4 h-4 sm:w-6 sm:h-6 text-primary-content" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium truncate w-full text-center">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="divider my-2 sm:my-4">Preview</div>

        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-base-content">
            How your app will look
          </h3>
          <div className="rounded-xl border border-base-300 bg-base-100 shadow-lg overflow-hidden">
            <div className="p-3 sm:p-6 bg-base-200">
              <div className="max-w-lg mx-auto space-y-4 sm:space-y-6">
                {SAMPLE_TODOS.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} isPreview />
                ))}

                <div className="card bg-base-100 shadow">
                  <div className="card-body p-3 sm:p-4">
                    <h3 className="font-bold text-sm sm:text-base text-base-content mb-3 sm:mb-4">
                      Add New Todo
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <input
                        type="text"
                        placeholder="Task description"
                        className="input input-bordered input-sm sm:input-md w-full"
                        readOnly
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          className="select select-bordered select-sm sm:select-md flex-1"
                          value="Category"
                          disabled
                        >
                          <option value="Category">Category</option>
                          <option value="Work">Work</option>
                          <option value="Personal">Personal</option>
                        </select>
                        <select
                          className="select select-bordered select-sm sm:select-md flex-1"
                          value="Priority"
                          disabled
                        >
                          <option value="Priority">Priority</option>
                          {Object.entries(PRIORITIES).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button className="btn btn-sm sm:btn-md btn-primary w-full">
                        Add Todo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemesPage;
