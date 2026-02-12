import { Search, X } from "lucide-react";
import { useState } from "react";

interface MapFiltersProps {
  onFilterChange: (filters: Filters) => void;
  onClose?: () => void;
}

export interface Filters {
  destination: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  duration: string;
}

export function MapFilters({ onFilterChange, onClose }: MapFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    destination: "",
    category: "all",
    budgetMin: 0,
    budgetMax: 5000,
    duration: "all",
  });

  const handleFilterUpdate = (key: keyof Filters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: Filters = {
      destination: "",
      category: "all",
      budgetMin: 0,
      budgetMax: 5000,
      duration: "all",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Map Filters
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="size-5 text-slate-600 dark:text-slate-400" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Destination Search */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Destination
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={filters.destination}
              onChange={(e) => handleFilterUpdate("destination", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterUpdate("category", e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
          >
            <option value="all">All Categories</option>
            <option value="beach">Beach</option>
            <option value="hills">Hills</option>
            <option value="adventure">Adventure</option>
            <option value="cultural">Cultural</option>
          </select>
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Budget Range
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>${filters.budgetMin}</span>
              <span>${filters.budgetMax}</span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={filters.budgetMin}
                onChange={(e) =>
                  handleFilterUpdate("budgetMin", parseInt(e.target.value))
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={filters.budgetMax}
                onChange={(e) =>
                  handleFilterUpdate("budgetMax", parseInt(e.target.value))
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Duration
          </label>
          <select
            value={filters.duration}
            onChange={(e) => handleFilterUpdate("duration", e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
          >
            <option value="all">All Durations</option>
            <option value="1-3">1-3 days</option>
            <option value="4-7">4-7 days</option>
            <option value="8-14">8-14 days</option>
            <option value="15+">15+ days</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {/* Active Filters Count */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {(() => {
            let count = 0;
            if (filters.destination) count++;
            if (filters.category !== "all") count++;
            if (filters.budgetMin > 0 || filters.budgetMax < 5000) count++;
            if (filters.duration !== "all") count++;
            return count > 0 ? `${count} filter${count > 1 ? "s" : ""} active` : "No filters active";
          })()}
        </p>
      </div>
    </div>
  );
}
