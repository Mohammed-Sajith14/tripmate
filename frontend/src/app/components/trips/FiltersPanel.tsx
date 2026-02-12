import { useState } from "react";
import { Search, X, Star } from "lucide-react";
import { TripFilters } from "./TripsPage";

interface FiltersPanelProps {
  filters: TripFilters;
  onFilterChange: (filters: TripFilters) => void;
  onReset: () => void;
}

const categories = [
  "Beach",
  "Hills",
  "Adventure",
  "Cultural",
  "Food & Culture",
  "Wellness",
  "Wildlife"
];

const durations = [
  { label: "1-3 days", value: "1-3" },
  { label: "4-7 days", value: "4-7" },
  { label: "8-14 days", value: "8-14" },
  { label: "15+ days", value: "15+" }
];

const difficulties = ["Easy", "Moderate", "Challenging"];

export function FiltersPanel({ filters, onFilterChange, onReset }: FiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<TripFilters>(filters);

  const handleDestinationChange = (value: string) => {
    const updated = { ...localFilters, destination: value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleCategoryToggle = (category: string) => {
    const updated = {
      ...localFilters,
      category: localFilters.category.includes(category)
        ? localFilters.category.filter(c => c !== category)
        : [...localFilters.category, category]
    };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleBudgetChange = (value: [number, number]) => {
    const updated = { ...localFilters, budgetRange: value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleDurationChange = (value: string) => {
    const updated = { ...localFilters, duration: value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleDifficultyChange = (value: string) => {
    const updated = { 
      ...localFilters, 
      difficulty: localFilters.difficulty === value ? "" : value 
    };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleRatingChange = (rating: number) => {
    const updated = { 
      ...localFilters, 
      organizerRating: localFilters.organizerRating === rating ? 0 : rating 
    };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const activeFiltersCount = 
    (localFilters.category.length > 0 ? 1 : 0) +
    (localFilters.destination ? 1 : 0) +
    (localFilters.difficulty ? 1 : 0) +
    (localFilters.organizerRating > 0 ? 1 : 0) +
    (localFilters.duration ? 1 : 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Destination Search */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Destination
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={localFilters.destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              placeholder="Search destinations..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
            />
            {localFilters.destination && (
              <button
                onClick={() => handleDestinationChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <X className="size-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  localFilters.category.includes(category)
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Budget Range
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={localFilters.budgetRange[1]}
              onChange={(e) => handleBudgetChange([0, parseInt(e.target.value)])}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                ${localFilters.budgetRange[0].toLocaleString()}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                ${localFilters.budgetRange[1].toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Duration
          </label>
          <div className="space-y-2">
            {durations.map(duration => (
              <button
                key={duration.value}
                onClick={() => handleDurationChange(duration.value === localFilters.duration ? "" : duration.value)}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                  localFilters.duration === duration.value
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {duration.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Difficulty Level
          </label>
          <div className="space-y-2">
            {difficulties.map(difficulty => (
              <button
                key={difficulty}
                onClick={() => handleDifficultyChange(difficulty)}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all flex items-center gap-2 ${
                  localFilters.difficulty === difficulty
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <div className={`size-2 rounded-full ${
                  difficulty === 'Easy' 
                    ? localFilters.difficulty === difficulty ? 'bg-white' : 'bg-green-500'
                    : difficulty === 'Moderate' 
                    ? localFilters.difficulty === difficulty ? 'bg-white' : 'bg-yellow-500'
                    : localFilters.difficulty === difficulty ? 'bg-white' : 'bg-orange-500'
                }`} />
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        {/* Organizer Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Minimum Organizer Rating
          </label>
          <div className="space-y-2">
            {[4.5, 4.0, 3.5].map(rating => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all flex items-center gap-2 ${
                  localFilters.organizerRating === rating
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <Star className={`size-4 ${
                  localFilters.organizerRating === rating 
                    ? "fill-white text-white" 
                    : "fill-yellow-400 text-yellow-400"
                }`} />
                {rating}+ stars
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
