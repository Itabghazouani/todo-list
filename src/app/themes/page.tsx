// src/app/themes/page.tsx
'use client';

import { useThemeStore } from '@/store/theme-store';
import { THEMES, PRIORITIES } from '@/constants';
import { TodoCard } from '@/components';
import { SAMPLE_TODOS } from '@/constants/sampleTodos';

const ThemesPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-8">
        {/* Theme Selection Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-base-content">Theme</h2>
            <p className="text-sm text-base-content/70">
              Choose a theme for your todo application
            </p>
          </div>

          {/* Theme Selection Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`
                  group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                  ${theme === t ? 'bg-base-200' : 'hover:bg-base-200/50'}
                `}
                onClick={() => setTheme(t)}
              >
                <div
                  className="relative h-8 w-full rounded-md overflow-hidden"
                  data-theme={t}
                >
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-base-content">Preview</h3>
          <div className="rounded-xl border border-base-300 bg-base-100 shadow-lg overflow-hidden">
            <div className="p-6 bg-base-200">
              <div className="max-w-lg mx-auto space-y-6">
                {/* Using our new TodoCard component for previews */}
                {SAMPLE_TODOS.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} isPreview />
                ))}

                {/* Add Todo Form Preview */}
                <div className="card bg-base-100 shadow">
                  <div className="card-body p-4">
                    <h3 className="font-bold text-base-content mb-4">
                      Add New Todo
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Task description"
                        className="input input-bordered w-full"
                        readOnly
                      />
                      <div className="flex gap-2">
                        <select
                          className="select select-bordered flex-1"
                          value="Category"
                          disabled
                        >
                          <option value="Category">Category</option>
                          <option value="Work">Work</option>
                          <option value="Personal">Personal</option>
                        </select>
                        <select
                          className="select select-bordered flex-1"
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
                      <button className="btn btn-primary w-full">
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
